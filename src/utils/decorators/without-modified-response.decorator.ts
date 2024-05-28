import { SetMetadata } from '@nestjs/common';

export const WithoutModifiedResponse = () =>
  SetMetadata('withoutModifiedResponse', true);
