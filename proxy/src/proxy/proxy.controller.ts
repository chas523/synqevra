import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { TelemetryDto } from './dtos/telemetryDto';
import { Public } from '../auth/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';

@Public()
@SkipThrottle()
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('telemetry')
  async postTelemetry(@Body(ValidationPipe) body: TelemetryDto) {
    return await this.proxyService.postTelemetry(body);
  }
}
