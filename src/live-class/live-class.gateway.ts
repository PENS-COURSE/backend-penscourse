import { Injectable, Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { AuthenticationService } from '../authentication/authentication.service';
import { LiveClassService } from './live-class.service';

@Injectable()
@WebSocketGateway({ namespace: '/live-class' })
export class LiveClassGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(LiveClassGateway.name);

  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly liveClassService: LiveClassService,
  ) {}

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('ping')
  handlePing(client: any, payload: any) {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${payload}`);
    return {
      event: 'pong',
      data: 'Wrong data that will make the test fail',
    };
  }

  @SubscribeMessage('newMessage')
  async listenForMessages(
    @MessageBody() message: string,
    @ConnectedSocket() socket: Socket,
  ) {
    this.logger.log(`Message received: ${message}`);
    const user = await this.authenticationService.handleUserFromSocket(socket);
    socket.emit('receivedMessage', message);
  }

  async handleConnection(socket: Socket) {
    await this.authenticationService.handleUserFromSocket(socket);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client disconnected ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('Init');
    this.liveClassService.socket = server;
  }
}
