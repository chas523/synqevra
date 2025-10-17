import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { InitialConnectionFormDto } from './dto/initial-connection-form.dto';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('connection')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Public()
  @Post('/connect')
  async buildInitialConnection(
    @Body() formData: InitialConnectionFormDto,
    @Query('token') token: string,
  ) {
    return await this.connectionService.buildInitialConnection(formData, token);
  }

  @Public()
  @Get('/checkValidation')
  async checkToken(@Query('token') token: string) {
    try {
      return await this.connectionService.validateToken(token);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
}
