import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { PostTelemetryUseCase } from '../../application/use-cases/post-telemetry.use-case';
import { TelemetryRequestDto } from './dto/telemetry-request.dto';
import { Public } from '../../../auth/decorators/public.decorator';
import { SkipThrottle } from '@nestjs/throttler';
import { PostTelemetryCommand } from '../../application/dto/post-telemetry.command';
import { TelemetryResponseDto } from './dto/telemetry-response.dto';
import { ApiOperation } from '@nestjs/swagger/dist/decorators/api-operation.decorator';

@Public()
@SkipThrottle()
@Controller('proxy')
export class ProxyController {
  constructor(private readonly postTelemetryUseCase: PostTelemetryUseCase) {}

  @Post('telemetry')
  @ApiOperation({
    summary: 'Test endpoint to post telemetry data',
    description:
      'Endpoint to post telemetry data for a device. Used for testing purposes - to create obseravations in Medplum via ThingsBoard rulechain.',
  })
  async postTelemetry(
    @Body(ValidationPipe) body: TelemetryRequestDto,
  ): Promise<TelemetryResponseDto> {
    const command: PostTelemetryCommand = {
      deviceId: body.deviceId,
      tenantId: body.tenantId,
      timestamp: body.timestamp,
      data: body.data,
    };

    return await this.postTelemetryUseCase.execute(command);
  }
}
