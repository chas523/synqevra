import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { TelemetryDto } from './dtos/telemetryDto';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('/proxy/telemetry')
  async postTelemetry(@Body(ValidationPipe) body: TelemetryDto) {
    return await this.proxyService.postTelemetry(body);
  }
}
