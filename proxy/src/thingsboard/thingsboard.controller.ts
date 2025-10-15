import { Controller, Post, Body } from '@nestjs/common';
import { ThingsboardConnectionFormDto } from './dtos/thingsboardConnectionForm.dto';
import { ThingsboardService } from './thingsboard.service';

@Controller('thingsboard')
export class ThingsboardController {
  constructor(private readonly thingsboardService: ThingsboardService) {}

  //not used since we're using thingsboardService.connectRegisterToThingsboard in another function
  // @Post('/connect/register')
  // async connectRegisterToThingsboard(
  //   @Body() formData: ThingsboardConnectionFormDto,
  // ) {
  //   return await this.thingsboardService.connectRegisterToThingsboard(formData);
  // }
}
