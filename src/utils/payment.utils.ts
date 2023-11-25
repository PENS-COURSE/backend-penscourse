import { BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';
import axios from 'axios';

export class PaymentHelpers {
  static async createOrder({
    payment_id,
    gross_amount,
    order_uuid,
    user,
  }: {
    payment_id: number;
    gross_amount: number;
    order_uuid: string;
    user: User;
  }) {
    const buf = Buffer.from(process.env.MIDTRANS_SERVER_KEY, 'utf8');

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${buf.toString('base64')}`,
    };

    let body = {};
    let namePayment: string | null = null;

    body = getPaymentConstantType(payment_id);
    body['transaction_details'] = {
      order_id: order_uuid,
      gross_amount: gross_amount.toString(),
    };

    body['customer_details'] = {
      first_name: user.name.split(' ')[0],
      last_name: user.name.split(' ')[1] || '',
      country_code: 'IDN',
    };

    namePayment = body['name'];

    delete body['name'];

    const response = await axios
      .post(
        'https://api.sandbox.midtrans.com/v2/charge',
        JSON.stringify(body),
        {
          headers,
        },
      )
      .then((res) => res.data)
      .catch(async (err) => {
        await this.cancelOrder({ order_uuid });
        console.log('PaymentHelpers -> createOrder -> err', err);
        throw new BadRequestException(err.message);
      });

    return {
      namePayment,
      response,
    };
  }

  static async cancelOrder({ order_uuid }: { order_uuid: string }) {
    const buf = Buffer.from(process.env.MIDTRANS_SERVER_KEY, 'utf8');

    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${buf.toString('base64')}`,
    };

    const response = await axios.post(
      `https://api.sandbox.midtrans.com/v2/${order_uuid}/cancel`,
      {
        headers,
      },
    );

    if (response.status == 200) {
      return true;
    } else {
      return false;
    }
  }
}

export const getPaymentConstantType = (payment_id: number) => {
  switch (payment_id) {
    case 1:
      return {
        payment_type: 'bank_transfer',
        bank_transfer: {
          bank: 'bca',
        },
        name: 'BCA Virtual Account',
      };
    case 2:
      return {
        payment_type: 'bank_transfer',
        bank_transfer: {
          bank: 'bni',
        },
        name: 'BNI Virtual Account',
      };
    case 3:
      return {
        payment_type: 'bank_transfer',
        bank_transfer: {
          bank: 'bri',
        },
        name: 'BRI Virtual Account',
      };
    case 4:
      return {
        payment_type: 'echannel',
        echannel: {
          bill_info1: 'Payment:',
          bill_info2: 'Online purchase',
        },
        name: 'Mandiri Bill Payment',
      };
    case 5:
      return {
        payment_type: 'permata',
        name: 'Permata Virtual Account',
      };
    case 6:
      return {
        payment_type: 'bank_transfer',
        bank_transfer: {
          bank: 'cimb',
        },
        name: 'CIMB Virtual Account',
      };
    case 7:
      return {
        payment_type: 'qris',
        name: 'QRIS',
      };
    case 8:
      return {
        payment_type: 'gopay',
        gopay: {
          enable_callback: true,
          callback_url: process.env.GOPAY_CALLBACK_URL,
        },
        name: 'GoPay',
      };
    case 9:
      return {
        payment_type: 'shopeepay',
        shopeepay: {
          callback_url: 'https://midtrans.com/',
        },
        name: 'ShopeePay',
      };
    case 10:
      return {
        payment_type: 'cstore',
        cstore: {
          store: 'Indomaret',
        },
        name: 'Indomaret',
      };
    case 11:
      return {
        payment_type: 'cstore',
        cstore: {
          store: 'alfamart',
        },
        name: 'Alfamart',
      };
    default:
      return null;
  }
};
