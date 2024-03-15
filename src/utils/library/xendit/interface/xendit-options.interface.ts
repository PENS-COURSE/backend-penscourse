import { Course, User } from '@prisma/client';

export interface XenditOptions {
  XENDIT_API_KEY: string;
  SUCCESS_REDIRECT_URL: string;
  FAILURE_REDIRECT_URL: string;
  LOCALE: string;
  CURRENCY: string;
}

export interface PayloadInvoiceData {
  externalId: string;
  user: User;
  course: Course;
  amount: number;
  description: string;
}
