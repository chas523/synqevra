import { JwtModuleOptions } from '@nestjs/jwt';
import { registerAs } from '@nestjs/config';

export default registerAs('jwt', (): JwtModuleOptions => {
  const expiresIn = process.env.JWT_EXPIRES_IN
    ? Number.isNaN(parseInt(process.env.JWT_EXPIRES_IN, 10))
      ? 3600
      : parseInt(process.env.JWT_EXPIRES_IN, 10)
    : 3600;

  return {
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn,
    },
  };
});
