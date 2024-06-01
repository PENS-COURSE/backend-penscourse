import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { SchedulerRegistry } from '@nestjs/schedule';
import { User } from '@prisma/client';
import axios from 'axios';
import { plainToInstance } from 'class-transformer';
import { Request } from 'express';
import { WebhookEvent } from 'livekit-server-sdk';
import { PrismaService } from '../prisma/prisma.service';
import { UserEntity } from '../users/entities/user.entity';
import { HashHelpers } from '../utils/hash.utils';
import { LivekitService } from '../utils/library/livekit/livekit.service';
import { StreamingPayloadURL } from './interface/streaming-payload-url';

@Injectable()
export class StreamingService {
  constructor(
    private liveKitService: LivekitService,
    private prisma: PrismaService,
    private schedulerRegistry: SchedulerRegistry,
    @Inject(REQUEST) private request: Request,
  ) {}

  async openStreaming({ roomSlug, user }: { roomSlug: string; user: User }) {
    return await this.prisma.$transaction(async (tx) => {
      const liveClass = await this.prisma.liveClass.findFirst({
        where: {
          slug: roomSlug,
        },
        include: {
          curriculum: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

      if (user.role !== 'admin') {
        if (
          liveClass.curriculum.course.user_id !== user.id &&
          user.role !== 'dosen'
        )
          throw new ForbiddenException('Anda tidak memiliki akses');
      }

      // TODO: Send Notification

      const data = await this.prisma.liveClass.update({
        where: {
          id: liveClass?.id,
        },
        data: {
          is_open: true,
          room_moderator_id: user.id,
          status: 'ongoing',
        },
      });

      console.log('data :>> ', data);

      return data;
    });
  }

  async closeStreaming({ roomSlug, user }: { roomSlug: string; user: User }) {
    return await this.prisma.$transaction(async (tx) => {
      const liveClass = await tx.liveClass.findFirst({
        where: {
          slug: roomSlug,
        },
        include: {
          curriculum: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

      if (user.role !== 'admin') {
        if (
          liveClass.curriculum.course.user_id !== user.id &&
          user.role !== 'dosen'
        )
          throw new ForbiddenException('Anda tidak memiliki akses');
      }

      const data = await tx.liveClass.update({
        where: {
          id: liveClass.id,
        },
        data: {
          is_open: false,
          status: 'ended',
        },
      });

      // TODO: CHECK RECORDING
      // const isRecording = await this.statusRecord({ roomSlug });
      // if (isRecording) {
      //   await this.stopRecord({ roomSlug: roomSlug });
      // }

      // LiveKit Close Room
      await this.liveKitService.deleteRoom(roomSlug);

      return data;
    });
  }

  async generateJoinUrl({ roomSlug, user }: { roomSlug: string; user: User }) {
    return await this.prisma.$transaction(async (tx) => {
      const liveClass = await this.prisma.liveClass.findFirst({
        where: {
          slug: roomSlug,
        },
        include: {
          room_moderator: true,
          curriculum: {
            include: {
              course: true,
            },
          },
        },
      });

      if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

      if (
        user.id !== liveClass.curriculum.course.user_id &&
        user?.role === 'user'
      ) {
        if (!liveClass.is_open)
          throw new ForbiddenException(
            'Ruangan belum dibuka, silahkan coba lagi nanti',
          );
      }

      // Check Enrollment
      if (user.role === 'user') {
        const isEnrolled = await this.prisma.enrollment.findFirst({
          where: {
            user_id: user.id,
            course_id: liveClass.curriculum.course_id,
          },
        });

        if (!isEnrolled)
          throw new ForbiddenException('Anda belum terdaftar pada kelas ini');
      }

      const roomToken = await this.liveKitService.createToken({
        roomName: liveClass.slug,
        user: user,
        isAdmin:
          user.id === liveClass.curriculum.course.user_id ||
          user.role === 'admin',
        token: this.request.headers.authorization,
      });

      // Expired in 1 minutes
      const expiredAt = new Date();
      expiredAt.setMinutes(expiredAt.getMinutes() + 1);

      const data: StreamingPayloadURL = {
        moderator: liveClass?.room_moderator?.name ?? 'Admin',
        room_token: roomToken,
        expired_at: expiredAt,
      };

      const dataString = JSON.stringify(data);

      // Save to Database
      const url = await this.prisma.urlSignature.create({
        data: {
          data: dataString,
          expired_at: expiredAt,
          user_id: user.id,
        },
      });

      const encryptedData = HashHelpers.encryptAES(url.id);

      return btoa(encryptedData);
    });
  }

  async verifyUrl(hashUrl: string) {
    try {
      const decryptedData = HashHelpers.decryptAES(atob(hashUrl));

      if (decryptedData === undefined)
        throw new ForbiddenException('URL tidak valid');

      const url = await this.prisma.urlSignature.findFirst({
        where: {
          id: decryptedData,
        },
      });

      if (!url) throw new ForbiddenException('URL tidak valid');

      if (url.is_used)
        throw new ForbiddenException(
          'URL telah digunakan, silahkan request kembali',
        );
      else {
        await this.prisma.urlSignature.update({
          where: {
            id: url.id,
          },
          data: {
            is_used: true,
          },
        });
      }

      if (url.expired_at < new Date())
        throw new ForbiddenException('URL sudah kadaluarsa');

      return JSON.parse(url.data.toString()) as StreamingPayloadURL;
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  async webhook(body: any) {
    const data = await this.liveKitService.webhook({
      body: body,
      authorization: this.request.headers.authorization,
    });

    console.log('Events :>> ', data.event);

    if (
      data.event === 'participant_joined' ||
      data.event === 'participant_left'
    ) {
      await this.logParticipant(data);

      await this.handleModeratorDisconnect(data);
    }

    if (data.event === 'room_finished') {
      await this.calculateDuration({ roomSlug: data.room.name });
    }

    return data;
  }

  async startRecord({ roomSlug }: { roomSlug: string }) {
    const liveClass = await this.prisma.liveClass.findFirst({
      where: {
        slug: roomSlug,
      },
      include: {
        curriculum: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

    const roomToken = await this.liveKitService.createToken({
      roomName: liveClass.slug,
      isAdmin: false,
      isGuest: true,
    });

    // Expired in 1 minutes
    const expiredAt = new Date();
    expiredAt.setMinutes(expiredAt.getMinutes() + 1);

    const data: StreamingPayloadURL = {
      // auth_token: this.request.headers.authorization,
      room_token: roomToken,
      expired_at: expiredAt,
    };

    const dataString = JSON.stringify(data);

    // Save to Database
    const url = await this.prisma.urlSignature.create({
      data: {
        data: dataString,
        expired_at: expiredAt,
      },
    });

    const encryptedData = HashHelpers.encryptAES(url.id);

    const base64EncryptedData = btoa(encryptedData);

    try {
      const response = await axios.post(
        process.env.RECORDING_SERVICE_URL + '/start-recording',
        {
          url: process.env.STREAMING_SERVICE_URL + base64EncryptedData,
          slug: roomSlug,
        },
        {
          headers: {
            ['Content-Type']: 'application/json',
            ['x-api-key']: process.env.RECORDING_SERVICE_API_KEY,
          },
        },
      );

      console.log('response :', response.data);

      const { uuid } = response.data.data;

      const recording = await this.prisma.recording.create({
        data: {
          unique_id: uuid,
          live_class_id: liveClass.id,
          status: response.status === 200 ? 'processing' : 'failed',
        },
      });

      return recording;
    } catch (error) {
      const recording = await this.prisma.recording
        .findMany({
          where: {
            live_class_id: liveClass.id,
            created_at: {
              gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            },
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        })
        .then((data) => data[0]);

      if (recording) {
        await this.prisma.recording.update({
          where: {
            id: recording.id,
          },
          data: {
            status: 'failed',
          },
        });
      }

      throw new InternalServerErrorException();
    }
  }

  async stopRecord({ roomSlug }: { roomSlug: string }) {
    const liveClass = await this.prisma.liveClass.findFirst({
      where: {
        slug: roomSlug,
      },
      include: {
        curriculum: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

    const recording = await this.prisma.recording
      .findMany({
        where: {
          live_class_id: liveClass.id,
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 1,
      })
      .then((data) => data[0]);

    if (!recording) throw new NotFoundException('Rekaman tidak ditemukan');

    try {
      const response = await axios
        .get(
          `${process.env.RECORDING_SERVICE_URL}/stop-recording?uuid=${recording.unique_id}`,
          {
            headers: {
              ['Content-Type']: 'application/json',
              ['x-api-key']: process.env.RECORDING_SERVICE_API_KEY,
            },
          },
        )
        .then(async (res) => {
          console.log('res :', res.data);
          await this.prisma.recording.update({
            where: {
              id: recording.id,
            },
            data: {
              url: res.data.data.path,
              status: res.status === 200 ? 'success' : 'failed',
            },
          });

          return res.data.data;
        });

      return response;
    } catch (error) {
      const recording = await this.prisma.recording
        .findMany({
          where: {
            live_class_id: liveClass.id,
          },
          orderBy: {
            created_at: 'desc',
          },
          take: 1,
        })
        .then((data) => data[0]);

      await this.prisma.recording.update({
        where: {
          id: recording.id,
        },
        data: {
          status: 'failed',
        },
      });

      throw new InternalServerErrorException();
    }
  }

  async statusRecord({ roomSlug }: { roomSlug: string }) {
    const liveClass = await this.prisma.liveClass.findFirst({
      where: {
        slug: roomSlug,
      },
      include: {
        curriculum: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

    const recording = await this.prisma.recording
      .findMany({
        where: {
          live_class_id: liveClass.id,
          created_at: {
            gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          created_at: 'desc',
        },
        take: 1,
      })
      .then((data) => data[0]);

    if (!recording) throw new NotFoundException('Rekaman tidak ditemukan');

    try {
      const response = await axios.get(
        `${process.env.RECORDING_SERVICE_URL}/stream/status/${recording.unique_id}`,
        {
          headers: {
            ['Content-Type']: 'application/json',
            ['x-api-key']: process.env.RECORDING_SERVICE_API_KEY,
          },
        },
      );

      return response.data.data;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getDetailLiveClass({ roomSlug }: { roomSlug: string }) {
    const liveClass = await this.prisma.liveClass.findFirst({
      where: {
        slug: roomSlug,
      },
      include: {
        curriculum: {
          include: {
            course: {
              include: {
                reviews: true,
                user: true,
              },
            },
          },
        },
      },
    });

    if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

    const totalRating = liveClass.curriculum.course?.reviews.reduce(
      (acc, review) => acc + review.rating,
      0,
    );
    const averageRating =
      totalRating / liveClass.curriculum?.course?.reviews.length;
    const totalUserRating = liveClass.curriculum?.course?.reviews.length;

    const user = plainToInstance(
      UserEntity,
      liveClass.curriculum?.course?.user,
      {},
    );

    return {
      title: liveClass.title,
      description: liveClass.description,
      course: {
        title: liveClass.curriculum?.course?.name,
        description: liveClass.curriculum?.course?.description,
        ratings: averageRating || 0,
        total_user_rating: totalUserRating,
        grade_level: liveClass.curriculum?.course?.grade_level,
        user: user,
      },
    };
  }

  private async logParticipant({ event, room, participant }: WebhookEvent) {
    const liveClass = await this.prisma.liveClass.findFirst({
      where: {
        slug: room.name,
      },
    });

    if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

    const user = JSON.parse(participant.metadata);
    const role = user.role as any;
    const userId = user.user_id as any;

    // Check if participant is not a guest
    if (participant.identity !== 'Guest') {
      let isParticipantHasJoined =
        await this.prisma.participantLiveClass.findFirst({
          where: {
            user_id: userId,
            live_class_id: liveClass.id,
          },
        });

      if (event === 'participant_joined') {
        if (role === 'user') {
          if (!isParticipantHasJoined) {
            isParticipantHasJoined =
              await this.prisma.participantLiveClass.create({
                data: {
                  user_id: userId,
                  live_class_id: liveClass.id,
                },
              });
          }

          await this.prisma.participantLog.create({
            data: {
              participant_live_class_id: isParticipantHasJoined.id,
              activity_type: 'join',
              user_agent: this.request.headers['user-agent'] ?? null,
            },
          });
        }
      }

      if (event === 'participant_left') {
        if (role === 'user') {
          if (!isParticipantHasJoined) {
            isParticipantHasJoined =
              await this.prisma.participantLiveClass.create({
                data: {
                  user_id: userId,
                  live_class_id: liveClass.id,
                },
              });
          }

          await this.prisma.participantLog.create({
            data: {
              participant_live_class_id: isParticipantHasJoined.id,
              activity_type: 'disconnect',
              user_agent: this.request.headers['user-agent'] ?? null,
            },
          });
        }
      }
    }
  }

  private async calculateDuration({ roomSlug }: { roomSlug: string }) {
    const liveClass = await this.prisma.liveClass.findFirst({
      where: {
        slug: roomSlug,
      },
    });

    if (!liveClass) throw new NotFoundException('Ruangan tidak ditemukan');

    const participantLogs = await this.prisma.participantLog.findMany({
      where: {
        participant_live_class: {
          live_class_id: liveClass.id,
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    let participantDurations = {};

    await Promise.all(
      participantLogs.map(async (log, index) => {
        if (log.activity_type === 'join') {
          if (
            participantDurations[log.participant_live_class_id] === undefined
          ) {
            participantDurations[log.participant_live_class_id] ??= {
              join: log.created_at,
              disconnect: null,
              duration: 0,
            };
          } else {
            participantDurations[log.participant_live_class_id].join =
              log.created_at;
          }
        } else if (log.activity_type === 'disconnect') {
          if (
            participantDurations[log.participant_live_class_id] === undefined
          ) {
            participantDurations[log.participant_live_class_id] = {
              join: null,
              disconnect: log.created_at,
              duration: 0,
            };
          } else {
            participantDurations[log.participant_live_class_id].disconnect =
              log.created_at;
          }
        }

        if (
          participantDurations[log.participant_live_class_id].join !== null &&
          participantDurations[log.participant_live_class_id].disconnect !==
            null
        ) {
          participantDurations[log.participant_live_class_id].duration +=
            (participantDurations[
              log.participant_live_class_id
            ].disconnect.getTime() -
              participantDurations[
                log.participant_live_class_id
              ].join.getTime()) /
            1000;

          participantDurations[log.participant_live_class_id].join = null;
          participantDurations[log.participant_live_class_id].disconnect = null;
        }

        await this.prisma.participantLiveClass.update({
          where: {
            id: log.participant_live_class_id,
          },
          data: {
            duration:
              participantDurations[log.participant_live_class_id].duration,
          },
        });
      }),
    );
  }

  private async handleModeratorDisconnect({
    event,
    room,
    participant,
  }: WebhookEvent) {
    const user = JSON.parse(participant.metadata);
    const role = user.role as any;
    const userId = user.user_id as any;

    if (role !== 'user') {
      const moderator = await this.prisma.user.findFirst({
        where: {
          id: userId,
          role: {
            not: 'user',
          },
        },
      });

      if (event === 'participant_left' && moderator) {
        // Close room after 5 minutes if moderator left
        const timeout = setTimeout(
          async () => {
            await this.liveKitService.deleteRoom(room.name);

            await this.prisma.liveClass.update({
              where: {
                slug: room.name,
              },
              data: {
                is_open: false,
                status: 'ended',
              },
            });
          },
          1000 * 60 * 5,
        );

        const isRecording = await this.prisma.recording
          .findMany({
            where: {
              live_class: {
                slug: room.name,
              },
              created_at: {
                gte: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
              },
            },
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
          })
          .then((data) => data[0]);

        if (isRecording) {
          await this.stopRecord({ roomSlug: room.name });
        }

        this.schedulerRegistry.addTimeout(`close-room-${room.name}`, timeout);
      } else if (event === 'participant_joined' && moderator) {
        if (this.schedulerRegistry.getTimeout(`close-room-${room.name}`)) {
          this.schedulerRegistry.deleteTimeout(`close-room-${room.name}`);
        }
      }
    }
  }
}
