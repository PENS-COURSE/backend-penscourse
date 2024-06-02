import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request } from 'express';
import { MODULE_OPTIONS_TOKEN } from './config.module-definition';
import { Xendit, XenditCallback } from './entity/xendit.entity';
import {
  PayloadInvoiceData,
  XenditOptions,
} from './interface/xendit-options.interface';

@Injectable()
export class XenditService {
  private readonly apiKey: string;
  private readonly successRedirectUrl: string;
  private readonly failureRedirectUrl: string;
  private readonly locale: string;
  private readonly currency: string;

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: XenditOptions,
    @Inject(REQUEST) private request: Request,
    private configService: ConfigService,
  ) {
    this.apiKey = options.XENDIT_API_KEY;
    this.successRedirectUrl = options.SUCCESS_REDIRECT_URL;
    this.failureRedirectUrl = options.FAILURE_REDIRECT_URL;
    this.locale = options.LOCALE;
    this.currency = options.CURRENCY;
  }

  async createSNAP(payload: PayloadInvoiceData) {
    try {
      const options: AxiosRequestConfig = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        auth: {
          username: this.apiKey,
          password: '',
        },
      };

      const data = {
        external_id: payload.externalId,
        amount: payload.amount,
        description: payload.description,
        invoice_duration: 86400,
        customer: {
          given_names: payload.user.name,
        },
        success_redirect_url: this.successRedirectUrl,
        failure_redirect_url: this.failureRedirectUrl,
        currency: 'IDR',
        locale: 'id',
        items: [
          {
            name: payload.course.name,
            price: payload.course.price,
            quantity: 1,
          },
        ],
        // Fee is optional
        // fees: [
        //   {
        //     type: 'ADMIN',
        //     value: 5000,
        //   },
        // ],
      };

      const response: AxiosResponse<Xendit> = await axios.post(
        'https://api.xendit.co/v2/invoices',
        data,
        options,
      );

      return response.data;
    } catch (error) {
      console.log('XenditUtils::>', error.response.status);
      console.log('XenditUtils::>', JSON.stringify(error.response.data));
      throw new Error(error);
    }
  }

  async getInvoice(invoiceId: string) {
    try {
      const options: AxiosRequestConfig = {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        auth: {
          username: this.apiKey,
          password: '',
        },
      };

      const response: AxiosResponse<Xendit> = await axios.get(
        `https://api.xendit.co/v2/invoices/${invoiceId}`,
        options,
      );

      return response.data;
    } catch (error: any) {
      console.log('XenditUtils::>', error.response.status);
      console.log('XenditUtils::>', JSON.stringify(error.response.data));
      throw new Error(error);
    }
  }

  async handleNotification(body: any): Promise<XenditCallback> {
    const xCallbackToken = this.request.headers['x-callback-token'];

    if (xCallbackToken !== this.configService.get('XENDIT_WEBHOOK_TOKEN')) {
      throw new ForbiddenException();
    }

    return body;
  }
}
