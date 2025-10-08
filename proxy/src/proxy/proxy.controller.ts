import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { TelemetryDto } from './dtos/telemetryDto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @Post('telemetry')
  async postTelemetry(@Body(ValidationPipe) body: TelemetryDto) {
    return await this.proxyService.postTelemetry(body);
  }
}
