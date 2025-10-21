import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { ThingsboardConnectionFormDto } from './dtos/thingsboardConnectionForm.dto';
import { ThingsboardService } from './thingsboard.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { ThingsboardAuthGuard } from 'src/auth/guards/thingsboard-auth/thingsboard-auth.guard';
import { TbAccessToken } from 'src/auth/decorators/tb-access-token.decorator';

@Controller('thingsboard')
@UseGuards(ThingsboardAuthGuard)
export class ThingsboardController {
  constructor(private readonly thingsboardService: ThingsboardService) {}

  //not used since we're using thingsboardService.connectRegisterToThingsboard in another function
  // @Post('/connect/register')
  // async connectRegisterToThingsboard(
  //   @Body() formData: ThingsboardConnectionFormDto,
  // ) {
  //   return await this.thingsboardService.connectRegisterToThingsboard(formData);
  // }
  //@Public()
  @Get('/')
  async getRoot(@TbAccessToken() accessToken: string) {
    return await this.thingsboardService.getUser(accessToken);
  }
}
