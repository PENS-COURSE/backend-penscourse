import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Channel, connect, Connection } from 'amqplib';

@Injectable()
export class ProducerService {
  private connection: Connection;
  private channel: Channel;

  constructor(private configService: ConfigService) {
    (async () => {
      this.connection = await connect(this.configService.get('RABBITMQ_URL'));
      this.channel = await this.connection.createChannel();
    })();
  }

  /**
   * Publish message to exchange
   * @param exchange
   * @param routingKey
   * @param message
   * @param isJSON
   **/
  async publishInQueue<T>({
    exchange,
    routingKey,
    data,
    isJSON = true,
  }: {
    exchange: string;
    routingKey: string;
    data: T;
    isJSON?: boolean;
  }) {
    const messageString = isJSON ? JSON.stringify(data) : String(data);
    this.channel.publish(exchange, routingKey, Buffer.from(messageString));

    console.log(`Message sent to ${exchange} with routing key ${routingKey}`);
  }
}
