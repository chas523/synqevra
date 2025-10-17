import { Body, Controller, Post } from '@nestjs/common';
import { MedplumService } from './medplum.service';
import { CreateProjectDto } from './dtos/createProjectDto';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type { CurrentUser } from '../auth/types/current-user';

@Controller('medplum')
export class MedplumController {
  constructor(private readonly medplumService: MedplumService) {}

  //not used since we're using medplumService.create in another function
  // @Post('connect')
  // async connect(
  //   @Body() dto: CreateProjectDto,
  //   @ActiveUser() user: CurrentUser,
  // ) {
  //   return this.medplumService.create(dto, user);
  // }
}
