import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshAdminAuthGuard extends AuthGuard('refresh-admin-jwt') {}
