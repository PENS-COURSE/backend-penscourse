import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from 'nestjs-prisma';
import {
  ApplyVoucherDto,
  CreateVoucherDto,
  UpdateVoucherDto,
} from './dto/voucher.dto';

@Injectable({})
export class VouchersService {
  constructor(private prisma: PrismaService) {}

  async createVoucher({ payload }: { payload: CreateVoucherDto }) {
    const {
      code,
      discount_type,
      discount_amount,
      min_purchase,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      is_active,
    } = payload;

    let voucherCode: string;

    // Validation Payload Logic
    if (start_date > end_date) {
      throw new BadRequestException(
        'Tanggal mulai tidak boleh lebih besar dari tanggal berakhir',
      );
    }

    if (!code) {
      voucherCode = Math.random().toString(36).substring(7).toUpperCase();
    } else {
      voucherCode = code;
    }

    return await this.prisma.voucher.create({
      data: {
        code: voucherCode,
        discount_type,
        discount_amount,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        usage_limit,
        is_active,
      },
    });
  }

  async getVoucherById({
    id,
    throwException = true,
    user,
  }: {
    id: number;
    throwException?: boolean;
    user?: User;
  }) {
    const data = await this.prisma.voucher.findUnique({
      where: {
        id: id,
        is_active: user.role === 'user' ? true : undefined,
      },
    });

    if (!data && throwException) {
      throw new BadRequestException('Voucher tidak ditemukan');
    }

    return data;
  }

  async getVoucherByCode({
    code,
    throwException = true,
    user,
  }: {
    code: string;
    throwException?: boolean;
    user?: User;
  }) {
    const data = await this.prisma.voucher.findUnique({
      where: {
        code: code,
        is_active: user.role === 'user' ? true : undefined,
      },
    });

    if (!data && throwException) {
      throw new BadRequestException('Voucher tidak ditemukan');
    }

    return data;
  }

  async getVouchers({ user }: { user: User }) {
    // TODO: Pagination
    if (user.role === 'user') {
      return await this.prisma.voucher.findMany({
        where: {
          is_active: true,
        },
      });
    } else {
      return await this.prisma.voucher.findMany();
    }
  }

  async updateVoucher({
    payload,
    id,
  }: {
    payload: UpdateVoucherDto;
    id: number;
  }) {
    const {
      code,
      discount_type,
      discount_amount,
      min_purchase,
      max_discount,
      start_date,
      end_date,
      usage_limit,
      is_active,
    } = payload;

    const voucher = await this.getVoucherById({ id });

    // Validation Payload Logic
    if (start_date > end_date) {
      throw new BadRequestException(
        'Tanggal mulai tidak boleh lebih besar dari tanggal berakhir',
      );
    }

    let voucherCode: string;
    if (!code) {
      voucherCode = Math.random().toString(36).substring(7).toUpperCase();
    } else {
      voucherCode = code;
    }

    return await this.prisma.voucher.update({
      where: {
        id: voucher.id,
      },
      data: {
        code: voucherCode,
        discount_type,
        discount_amount,
        min_purchase,
        max_discount,
        start_date,
        end_date,
        usage_limit,
        is_active,
      },
    });
  }

  async deleteVoucher({ id }: { id: number }) {
    const voucher = await this.getVoucherById({ id });

    return await this.prisma.voucher.delete({
      where: {
        id: voucher.id,
      },
    });
  }

  async applyVoucher({
    payload,
    user,
  }: {
    payload: ApplyVoucherDto;
    user: User;
  }) {
    const { code, order_id } = payload;

    const order = await this.prisma.order.findFirst({
      where: {
        id: order_id,
        user_id: user.id,
      },
    });

    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const voucher = await this.getVoucherByCode({ code });

    // Validation Voucher Logic
    if (voucher.usage_limit <= 0) {
      throw new BadRequestException('Voucher sudah tidak bisa digunakan');
    }

    if (voucher.start_date > new Date() || voucher.end_date < new Date()) {
      throw new BadRequestException('Voucher sudah tidak bisa digunakan');
    }

    if (voucher.min_purchase > new Decimal(order.total_price)) {
      throw new BadRequestException('Total belanja tidak memenuhi syarat');
    }

    if (voucher?.max_discount < new Decimal(order.total_price)) {
      throw new BadRequestException('Total belanja melebihi batas maksimal');
    }

    const discountAmount =
      voucher.discount_type === 'percentage'
        ? (Number(voucher.discount_amount) / 100) * order.total_price
        : voucher.discount_amount;

    // Update Voucher
    await this.prisma.voucher.update({
      where: {
        id: voucher.id,
      },
      data: {
        redemptions: {
          create: {
            user_id: user.id,
            order_id: order.id,
            discount_amount: new Decimal(discountAmount),
          },
        },
      },
    });

    // TODO: Implement Discount to Order & Decrease Usage Limit
    return Math.max(0, order.total_price - Number(discountAmount));
  }

  async cancelVoucher({
    payload,
    user,
  }: {
    payload: ApplyVoucherDto;
    user: User;
  }) {
    const { code, order_id } = payload;

    const order = await this.prisma.order.findFirst({
      where: {
        id: order_id,
        user_id: user.id,
      },
    });

    if (!order) throw new NotFoundException('Order tidak ditemukan');

    const voucher = await this.getVoucherByCode({ code });

    const redemption = await this.prisma.voucherRedemption.findFirst({
      where: {
        user_id: user.id,
        order_id: order.id,
      },
    });

    if (redemption) {
      // Update Voucher
      await this.prisma.voucher.update({
        where: {
          id: voucher.id,
        },
        data: {
          redemptions: {
            delete: {
              id: redemption.id,
            },
          },
        },
      });

      return true;
    } else {
      throw new BadRequestException('Voucher tidak terpasang pada order ini');
    }
  }

  async getRedemptions({ id }: { id: number }) {
    // TODO: Pagination

    const voucher = await this.getVoucherById({ id });

    return await this.prisma.voucherRedemption.findMany({
      where: {
        voucher_id: voucher.id,
      },
    });
  }

  async getRedemptionById({ id }: { id: number }) {
    return await this.prisma.voucherRedemption.findUnique({
      where: {
        id: id,
      },
      include: {
        user: true,
        order: true,
      },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async expiredVoucher() {
    const vouchers = await this.prisma.voucher.findMany({
      where: {
        end_date: {
          lt: new Date(),
        },
      },
    });

    await this.prisma.voucher.updateMany({
      where: {
        id: {
          in: vouchers.map((voucher) => voucher.id),
        },
      },
      data: {
        is_active: false,
      },
    });
  }
}
