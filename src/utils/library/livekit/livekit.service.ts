import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { User } from '@prisma/client';
import { Request } from 'express';
import {
  AccessToken,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  RoomServiceClient,
  WebhookReceiver,
} from 'livekit-server-sdk';
import { PrismaService } from 'nestjs-prisma';

@Injectable()
export class LivekitService {
  constructor(
    private prisma: PrismaService,
    @Inject(REQUEST) private request: Request,
  ) {}

  async createToken({
    roomName,
    user,
    isAdmin,
    isGuest,
    token,
  }: {
    roomName: string;
    user?: User;
    isAdmin: boolean;
    isGuest?: boolean;
    token?: string;
  }) {
    const config = await this.getConfig();

    const accessToken = new AccessToken(
      config.LIVEKIT_API_KEY,
      config.LIVEKIT_API_SECRET,
      {
        identity: isGuest ? 'Guest' : user?.name,
        metadata: isGuest
          ? null
          : JSON.stringify({
              user_id: user.id,
              user_name: user.name,
              role: isGuest ? 'guest' : user.role,
              token,
            }),
      },
    );

    if (isAdmin) {
      accessToken.addGrant({
        roomJoin: true,
        room: roomName,
        canSubscribe: true,
        canPublish: true,
        canPublishData: true,
        roomAdmin: true,
      });
    } else {
      accessToken.addGrant({
        roomJoin: true,
        room: roomName,
        canSubscribe: true,
        canPublish: false,
        canPublishData: true,
      });
    }

    if (isGuest) {
      accessToken.addGrant({
        roomJoin: true,
        room: roomName,
        canSubscribe: true,
        canPublish: false,
        canPublishData: true,
      });
    }

    return await accessToken.toJwt();
  }

  async deleteRoom(roomName: string) {
    const config = await this.getConfig();

    const roomService = new RoomServiceClient(
      config.LIVEKIT_API_HOST,
      config.LIVEKIT_API_KEY,
      config.LIVEKIT_API_SECRET,
    );

    return await roomService.deleteRoom(roomName).then(() => {
      return true;
    });
  }

  async listParticipants(roomName: string) {
    const config = await this.getConfig();

    const roomService = new RoomServiceClient(
      config.LIVEKIT_API_HOST,
      config.LIVEKIT_API_KEY,
      config.LIVEKIT_API_SECRET,
    );

    return await roomService.listParticipants(roomName);
  }

  async record({ roomName }: { roomName: string }) {
    const config = await this.getConfig();

    const egressClient = new EgressClient(
      config.LIVEKIT_API_HOST,
      config.LIVEKIT_API_KEY,
      config.LIVEKIT_API_SECRET,
    );

    const output: EncodedFileOutput = {
      filepath: 'recordings',
      fileType: EncodedFileType.MP4,
    };

    return await egressClient.startRoomCompositeEgress(
      roomName,
      {
        file: output,
      },
      {
        layout: 'speaker',
      },
    );
  }

  async webhook({ body, authorization }: { body: any; authorization: string }) {
    const config = await this.getConfig();

    const eventService = new WebhookReceiver(
      config.LIVEKIT_API_KEY,
      config.LIVEKIT_API_SECRET,
    );

    return await eventService.receive(body, authorization);
  }

  private async getConfig() {
    const liveKit = await this.prisma.dynamicConfigurations.findFirst({
      where: {
        title: 'Xendit',
      },
      include: {
        DynamicConfigurationValues: true,
      },
    });

    const LIVEKIT_API_HOST = liveKit?.DynamicConfigurationValues.find(
      (value) => value.key === 'LIVEKIT_API_HOST',
    )?.value;

    const LIVEKIT_API_KEY = liveKit?.DynamicConfigurationValues.find(
      (value) => value.key === 'LIVEKIT_API_KEY',
    )?.value;

    const LIVEKIT_API_SECRET = liveKit?.DynamicConfigurationValues.find(
      (value) => value.key === 'LIVEKIT_API_SECRET',
    )?.value;

    return {
      LIVEKIT_API_HOST: LIVEKIT_API_HOST ?? process.env.LIVEKIT_API_HOST,
      LIVEKIT_API_KEY: LIVEKIT_API_KEY ?? process.env.LIVEKIT_API_KEY,
      LIVEKIT_API_SECRET: LIVEKIT_API_SECRET ?? process.env.LIVEKIT_API_SECRET,
    };
  }
}
