import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [OrdersModule],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
