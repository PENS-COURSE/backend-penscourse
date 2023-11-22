import { SetMetadata } from '@nestjs/common';

export const IsRefreshTokenKey = 'is-refresh-token';

export const IsRefreshToken = () => SetMetadata(IsRefreshTokenKey, true);
