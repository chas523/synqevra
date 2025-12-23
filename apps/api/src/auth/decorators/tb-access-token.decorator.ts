// tb-access-token.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithTbToken } from '../guards/thingsboard-auth/thingsboard-auth.guard';

export const TbAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest<RequestWithTbToken>();
    return req.tbAccessToken;
  },
);
