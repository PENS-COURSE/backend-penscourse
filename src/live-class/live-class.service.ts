import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class LiveClassService {
  public socket: Server | null = null;
}
