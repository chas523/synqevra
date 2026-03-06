import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpCode,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { match, Result } from 'oxide.ts';
import {
  TBAdminGetError,
  TBAdminGetNotificationsError,
  TBAdminGetTenantDevicesError,
  TBAdminGetTenantsUsersError,
} from '../../domain/errors/thingsboard-admin.errors';
import { GetTenantsResponse } from './dtos/response/thingsboard-get-tenants.response.dto';
import { FetchTenantsQuery } from '../../application/queries/fetch-tenants/fetch-tenants.query';
import { FetchTenantDevicesQuery } from '../../application/queries/fetch-tenant-devices/fetch-tenant-devices.query';
import { FetchTenantUsersQuery } from '../../application/queries/fetch-users-by-tenant/fetch-tenant-users.query';
import { GetTenantUsersResponse } from './dtos/response/thingsboard-get-tenant-users.response.dto';
import { GetTenantDevicesResponse } from './dtos/response/thingsboard-get-tenant-devices.response.dto';
import { FetchNotificationsQuery } from '../../application/queries/fetch-notifications/fetch-notifications.query';
import { GetNotificationsResponse } from './dtos/response/thingsboard-get-notifications.response.dto';
import { FetchTenantAttributesQuery } from '../../application/queries/fetch-tenant-attributes/fetch-tenant-attributes.query';
import { FetchTenantAlarmsQuery } from '../../application/queries/fetch-tenant-alarms/fetch-tenant-alarms.query';
import { FetchTenantEventsQuery } from '../../application/queries/fetch-tenant-events/fetch-tenant-events.query';
import { CreateRelationCommand } from 'src/thingsboard/application/commands/create-relation/create-relation.command';
import { DeleteRelationCommand } from 'src/thingsboard/application/commands/delete-relation/delete-relation.command';
import { FetchTenantRelationsQuery } from '../../application/queries/fetch-tenant-relations/fetch-tenant-relations.query';
import { UpdateTenantCommand } from '../../application/commands/update-tenant/update-tenant.command';
import { SaveEntityAttributesCommand } from '../../application/commands/save-entity-attributes/save-entity-attributes.command';
import { FetchTenantProfilesQuery } from '../../application/queries/fetch-tenant-profiles/fetch-tenant-profiles.query';
import { SaveTenantProfileCommand } from '../../application/commands/save-tenant-profile/save-tenant-profile.command';
import {
  TenantAttributesResponse,
  EntityAlarmsResponse,
  EntityEventsResponse,
  EntityRelationsResponse,
  TenantResponse,
  TenantProfilesResponse,
} from '../../application/ports/thingsboard.api.port';
import type { UpdateTenantDto } from '../../application/ports/thingsboard.api.port';
import { FetchTenantProfileAttributesQuery } from '../../application/queries/fetch-tenant-profile-attributes/fetch-tenant-profile-attributes.query';
import { FetchTenantProfileAlarmsQuery } from '../../application/queries/fetch-tenant-profile-alarms/fetch-tenant-profile-alarms.query';
import { ThingsboardAuthGuard } from 'src/auth/guards/thingsboard-auth/thingsboard-auth.guard';
import { TbAccessToken } from 'src/auth/decorators/tb-access-token.decorator';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/iam/domain/enums/role.enum';
import { StorageService } from '../../application/services/storage.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly storageService: StorageService,
  ) {}

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenants')
  async getTenants(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchTenantsQuery(
      {
        page: Number(page),
        pageSize: Number(pageSize),
      },
      accessToken,
    );
    const result: Result<GetTenantsResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetTenantsResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenant-profiles')
  async getTenantProfiles(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
    @TbAccessToken() accessToken: string,
    @Query('sortProperty') sortProperty?: string,
    @Query('sortOrder') sortOrder?: string,
    @Query('textSearch') textSearch?: string,
  ) {
    const query = new FetchTenantProfilesQuery(
      Number(page),
      Number(pageSize),
      sortProperty,
      sortOrder,
      textSearch,
      accessToken,
    );
    const result: Result<TenantProfilesResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: TenantProfilesResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('tenant-profiles/:id')
  @HttpCode(HttpStatus.OK)
  async saveTenantProfile(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Body() tenantProfile: any,
  ): Promise<any> {
    const command = new SaveTenantProfileCommand(tenantProfile, accessToken);
    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: (profile) => profile,
      Err: (error) => {
        throw new HttpException(
          'Failed to save tenant profile',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('tenant-profiles/:id/attributes')
  async getTenantProfileAttributes(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('scope')
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE' = 'SERVER_SCOPE',
  ) {
    const query = new FetchTenantProfileAttributesQuery(id, scope, accessToken);
    const result: Result<TenantAttributesResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: TenantAttributesResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('tenant-profiles/:id/attributes')
  async saveTenantProfileAttributes(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Body()
    body: {
      scope?: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE';
      attributes: Record<string, unknown>;
    },
  ) {
    const scope = body.scope || 'SERVER_SCOPE';
    const command = new SaveEntityAttributesCommand(
      'TENANT_PROFILE',
      id,
      scope,
      body.attributes,
      accessToken,
    );
    const result: Result<void, TBAdminGetError> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('tenant-profiles/:id/alarms')
  async getTenantProfileAlarms(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('statusList') statusList?: string,
    @Query('severityList') severityList?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const statusArray = statusList ? statusList.split(',') : undefined;
    const severityArray = severityList ? severityList.split(',') : undefined;
    const startTimeNum = startTime ? Number(startTime) : undefined;
    const endTimeNum = endTime ? Number(endTime) : undefined;
    const query = new FetchTenantProfileAlarmsQuery(
      id,
      Number(page),
      Number(pageSize),
      statusArray,
      severityArray,
      startTimeNum,
      endTimeNum,
      accessToken,
    );
    const result: Result<EntityAlarmsResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: EntityAlarmsResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenants/:id/users')
  async getTenantUsers(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchTenantUsersQuery(
      {
        tenantId: id,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      accessToken,
    );
    const result: Result<GetTenantUsersResponse, TBAdminGetTenantsUsersError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetTenantUsersResponse) => dto,
      Err: (error: TBAdminGetTenantsUsersError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenants/:id/devices')
  async getTenantDevices(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchTenantDevicesQuery(
      {
        tenantId: id,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      accessToken,
    );
    const result: Result<
      GetTenantDevicesResponse,
      TBAdminGetTenantDevicesError
    > = await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetTenantDevicesResponse) => dto,
      Err: (error: TBAdminGetTenantDevicesError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.PRACTITIONER)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/notifications')
  async getNotifications(
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 20,
    @TbAccessToken() accessToken: string,
  ) {
    const query = new FetchNotificationsQuery(
      {
        page: Number(page),
        pageSize: Number(pageSize),
      },
      accessToken,
    );

    const result: Result<
      GetNotificationsResponse,
      TBAdminGetNotificationsError
    > = await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: GetNotificationsResponse) => dto,
      Err: (error: TBAdminGetNotificationsError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenants/:id/attributes')
  async getTenantAttributes(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('scope')
    scope: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE' = 'SERVER_SCOPE',
  ) {
    const query = new FetchTenantAttributesQuery(id, scope, accessToken);
    const result: Result<TenantAttributesResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: TenantAttributesResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenants/:id/alarms')
  async getTenantAlarms(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('statusList') statusList?: string,
    @Query('severityList') severityList?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const statusArray = statusList ? statusList.split(',') : undefined;
    const severityArray = severityList ? severityList.split(',') : undefined;
    const startTimeNum = startTime ? Number(startTime) : undefined;
    const endTimeNum = endTime ? Number(endTime) : undefined;
    const query = new FetchTenantAlarmsQuery(
      id,
      Number(page),
      Number(pageSize),
      statusArray,
      severityArray,
      startTimeNum,
      endTimeNum,
      accessToken,
    );
    const result: Result<EntityAlarmsResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: EntityAlarmsResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenants/:id/events')
  async getTenantEvents(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('page') page = 0,
    @Query('pageSize') pageSize = 10,
    @Query('eventType') eventType?: string,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const start = startTime ? parseInt(startTime, 10) : undefined;
    const end = endTime ? parseInt(endTime, 10) : undefined;

    const query = new FetchTenantEventsQuery(
      id,
      Number(page),
      Number(pageSize),
      eventType,
      start,
      end,
      accessToken,
    );
    const result: Result<EntityEventsResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: EntityEventsResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Get('/tenants/:id/relations')
  async getTenantRelations(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('direction') direction: 'FROM' | 'TO' = 'FROM',
  ) {
    const query = new FetchTenantRelationsQuery(id, direction, accessToken);
    const result: Result<EntityRelationsResponse, TBAdminGetError> =
      await this.queryBus.execute(query);

    return match(result, {
      Ok: (dto: EntityRelationsResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Put('/tenants/:id')
  async updateTenant(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Body() tenantData: UpdateTenantDto,
  ) {
    // Make sure the ID matches
    const dataWithId = {
      ...tenantData,
      id: { entityType: 'TENANT', id },
    };
    const command = new UpdateTenantCommand(dataWithId, accessToken);
    const result: Result<TenantResponse, TBAdminGetError> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: (dto: TenantResponse) => dto,
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/tenants/:id/attributes')
  async saveTenantAttributes(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Body()
    body: {
      scope?: 'SERVER_SCOPE' | 'CLIENT_SCOPE' | 'SHARED_SCOPE';
      attributes: Record<string, unknown>;
    },
  ) {
    const scope = body.scope || 'SERVER_SCOPE';
    const command = new SaveEntityAttributesCommand(
      'TENANT',
      id,
      scope,
      body.attributes,
      accessToken,
    );
    const result: Result<void, TBAdminGetError> =
      await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ success: true }),
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/tenants/:id/relations')
  async saveTenantRelation(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Body() relation: any,
  ) {
    const command = new CreateRelationCommand(
      relation.from.id,
      relation.from.entityType,
      relation.to.id,
      relation.to.entityType,
      relation.type,
      relation.additionalInfo,
      accessToken,
    );

    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ status: 'ok' }),
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Delete('/tenants/:id/relations')
  async deleteTenantRelation(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @Query('fromId') fromId: string,
    @Query('fromType') fromType: string,
    @Query('relationType') relationType: string,
    @Query('toId') toId: string,
    @Query('toType') toType: string,
  ) {
    const command = new DeleteRelationCommand(
      fromId,
      fromType,
      relationType,
      toId,
      toType,
      accessToken,
    );

    const result = await this.commandBus.execute(command);

    return match(result, {
      Ok: () => ({ status: 'ok' }),
      Err: (error: TBAdminGetError) => {
        throw error;
      },
    });
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/tenants/:id/whitelabel')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logoWhite', maxCount: 1 },
      { name: 'logoDark', maxCount: 1 },
    ]),
  )
  async uploadWhitelabelImages(
    @Param('id') id: string,
    @TbAccessToken() accessToken: string,
    @UploadedFiles()
    files: {
      logoWhite?: Express.Multer.File[];
      logoDark?: Express.Multer.File[];
    },
  ) {
    const uploadedPaths: Record<string, string> = {};

    try {
      if (files?.logoWhite?.[0]) {
        const path = await this.storageService.uploadFile(
          files.logoWhite[0],
          id,
          `logo-white.svg`,
        );
        uploadedPaths.logoWhite = path;
      }

      if (files?.logoDark?.[0]) {
        const path = await this.storageService.uploadFile(
          files.logoDark[0],
          id,
          `logo-dark.svg`,
        );
        uploadedPaths.logoDark = path;
      }

      return {
        success: true,
        paths: uploadedPaths,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to upload whitelabel images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Roles(Role.ADMIN)
  @UseGuards(ThingsboardAuthGuard)
  @Post('/settings/whitelabel')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logoWhite', maxCount: 1 },
      { name: 'logoDark', maxCount: 1 },
    ]),
  )
  async uploadGlobalWhitelabelImages(
    @TbAccessToken() accessToken: string,
    @UploadedFiles()
    files: {
      logoWhite?: Express.Multer.File[];
      logoDark?: Express.Multer.File[];
    },
  ) {
    const uploadedPaths: Record<string, string> = {};

    try {
      if (files?.logoWhite?.[0]) {
        const path = await this.storageService.uploadFile(
          files.logoWhite[0],
          'global',
          `logo-white.svg`,
        );
        uploadedPaths.logoWhite = path;
      }

      if (files?.logoDark?.[0]) {
        const path = await this.storageService.uploadFile(
          files.logoDark[0],
          'global',
          `logo-dark.svg`,
        );
        uploadedPaths.logoDark = path;
      }

      return {
        success: true,
        paths: uploadedPaths,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to upload global whitelabel images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
