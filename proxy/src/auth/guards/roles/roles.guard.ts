import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../enums/role.enum';
import { ROLES_KEY } from '../../decorators/roles.decorator';
import { CurrentUser } from '../../types/current-user';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request: Request & { user: CurrentUser } = context
      .switchToHttp()
      .getRequest();
    const user = request.user as CurrentUser | undefined;

    if (!user) {
      throw new UnauthorizedException('User is not authenticated');
    }

    return requiredRoles.some((role) => user.role === role);
  }
}
