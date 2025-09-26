import {
  Body,
  Controller,
  Post,
  ValidationPipe,
  Headers,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { ObservationRequestDto } from './dtos/observation.dto';
import { RefreshErrorDto } from './dtos/refreshErrorDto';
import { RefreshResponseDto } from './dtos/refreshResponse.dto';

@Controller()
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('/proxy/forwardObservation')
  async sendObservation(
    @Headers() headers: Record<string, any>,
    @Body(ValidationPipe) body: ObservationRequestDto,
  ) {
    try {
      const response = await this.proxyService.forwardObservation(
        body.payload,
        headers,
      );

      if (response.status === 201 || response.status === 200) {
        return {
          message: 'Observation forwarded successfully',
          data: response.data,
        };
      } else {
        const tokens: RefreshResponseDto | RefreshErrorDto =
          await this.proxyService.refreshToken(body.refreshToken);
        console.log(tokens)
        if (tokens instanceof RefreshErrorDto) {
          return {
            message: 'Failed to refresh token',
            error: tokens,
          };
        }

        const newHeaders: Record<string, any> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens['access_token']}`,
          'accept': '*/*',
          'host': 'localhost:3003',
          'accept-encoding': 'gzip, deflate, br',
          'connection': 'keep-alive',
        };
        console.log(headers);
        console.log(newHeaders);
        const newResponse = await this.proxyService.forwardObservation(
          body.payload,
          newHeaders,
        );

        if (newResponse.status === 201 || newResponse.status === 200) {
          return {
            message: 'Observation forwarded successfully, tokens refreshed',
            tokens: tokens,
            data: newResponse.data,
          };
        } else throw new Error(newResponse.data);
      }
    } catch (error) {
      console.error('Error in controller: ', error);
      return 1;
    }
  }


}
