import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { User } from '@prisma/client';
import axios from 'axios';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { HashHelpers } from '../utils/hash.utils';
import { LivekitService } from '../utils/library/livekit/livekit.service';
import { StreamingPayloadURL } from './interface/streaming-payload-url';

@Injectable()
export class StreamingService {
  constructor(
    private liveKitService: LivekitService,
    private prisma: PrismaService,
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

      if (user.role !== 'admin') {
        if (
          liveClass.curriculum.course.user_id !== user.id &&
          user.role !== 'dosen'
        )
          throw new ForbiddenException('Anda tidak memiliki akses');
      }

      // TODO: Send Notification

      await this.prisma.liveClass.update({
        where: {
          id: liveClass.id,
        },
        data: {
          is_open: true,
          room_moderator_id: user.id,
        },
      });

      return this.generateJoinUrl({ roomSlug, user });
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

      // TODO: Check Enrollment

      const roomToken = await this.liveKitService.createToken({
        roomName: liveClass.slug,
        user: user,
        isAdmin:
          user.id === liveClass.curriculum.course.user_id ||
          user.role === 'admin',
      });

      if (
        user.id !== liveClass.curriculum.course.user_id ||
        user.role !== 'dosen' ||
        'admin'
      ) {
        if (!liveClass.is_open)
          throw new ForbiddenException(
            'Ruangan belum dibuka, silahkan coba lagi nanti',
          );
      }

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

    console.log('data :', data);

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
}
