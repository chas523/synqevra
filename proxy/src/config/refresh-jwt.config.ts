import { JwtSignOptions } from '@nestjs/jwt';
import { registerAs } from '@nestjs/config';

export default registerAs('refresh', (): JwtSignOptions => {
  const expiresIn = process.env.REFRESH_JWT_EXPIRES_IN
    ? parseInt(process.env.REFRESH_JWT_EXPIRES_IN, 10)
    : 604800;

  return {
    secret: process.env.REFRESH_JWT_SECRET,
    expiresIn,
  };
});
