import { Controller, Post, Body } from '@nestjs/common';
import { ThingsboardConnectionFormDto } from './dtos/thingsboardConnectionForm.dto';
import { ThingsboardService } from './thingsboard.service';

@Controller('thingsboard')
export class ThingsboardController {
  constructor(private readonly thingsboardService: ThingsboardService) {}

  @Post('/connect/register')
  async connectRegisterToThingsboard(
    @Body() formData: ThingsboardConnectionFormDto,
  ) {
    return await this.thingsboardService.connectRegisterToThingsboard(formData);
  }
}
