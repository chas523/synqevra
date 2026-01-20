import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SocketWithUser } from '../guards/thingsboard-ws-auth/thingsboard-ws-auth.guard';

export const WsTbAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient<SocketWithUser>();
    return client.tbAccessToken;
  },
);
