import { SetMetadata } from '@nestjs/common';

export const AllowUnauthorizedRequestKey = 'allow-unauthorized-request';

export const AllowUnauthorizedRequest = () =>
  SetMetadata('allow-unauthorized-request', true);
