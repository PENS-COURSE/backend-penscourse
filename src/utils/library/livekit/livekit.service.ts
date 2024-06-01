import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

@Injectable()
export class LivekitService {
  constructor(
    private configService: ConfigService,
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
    const accessToken = new AccessToken(
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
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
    const roomService = new RoomServiceClient(
      this.configService.get('LIVEKIT_API_HOST'),
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
    );

    return await roomService.deleteRoom(roomName).then(() => {
      return true;
    });
  }

  async listParticipants(roomName: string) {
    const roomService = new RoomServiceClient(
      this.configService.get('LIVEKIT_API_HOST'),
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
    );

    return await roomService.listParticipants(roomName);
  }

  async record({ roomName }: { roomName: string }) {
    const egressClient = new EgressClient(
      this.configService.get('LIVEKIT_API_HOST'),
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
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
    const eventService = new WebhookReceiver(
      this.configService.get('LIVEKIT_API_KEY'),
      this.configService.get('LIVEKIT_API_SECRET'),
    );

    return await eventService.receive(body, authorization);
  }
}
