import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { plainToInstance } from 'class-transformer';
import { firstValueFrom } from 'rxjs';
import * as process from 'node:process';
import { RefreshResponseDto } from './dtos/refreshResponse.dto';
import { RefreshErrorDto } from './dtos/refreshErrorDto';
import { webcrypto } from 'crypto';

@Injectable()
export class ProxyService {
  constructor(private readonly http: HttpService) {}
  private readonly medplumUrl: string =
    process.env.MEDPLUM_URL ?? 'http://host.docker.internal:8103';

  private async decode(token: string): Promise<string> {
    const subtle = webcrypto.subtle;
    const keyB64 = process.env.SYNC_KEY;
    if (!keyB64) throw new Error('SYNC_KEY is missing');

    const keyRaw = Buffer.from(keyB64, 'base64');
    if (keyRaw.length !== 32)
      throw new Error('SYNC_KEY must be 32 bytes (base64 of 32B)');

    const cryptoKey = await subtle.importKey('raw', keyRaw, 'AES-GCM', false, [
      'decrypt',
    ]);

    const data = Buffer.from(token, 'base64');
    const iv = data.subarray(0, 12);
    const ct = data.subarray(12);

    const ptBuf = await subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);
    return new TextDecoder().decode(ptBuf);
  }

  async forwardObservation(
    payload: any,
    incomingHeaders: Record<string, string | string[] | undefined>,
  ) {
    try {
      const body = new URLSearchParams(payload);
      console.log(body.toString());

      const res = await firstValueFrom(
        this.http.post(
          `${this.medplumUrl}/fhir/R4/Observation`,
          body.toString(),
          {
            headers: incomingHeaders,
          },
        ),
      );
      console.log(res.data)
      console.log("asdasdasd");
      return { status: res.status, data: res.data };
    } catch (error) {
      return { status: 400, data: error };
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<RefreshResponseDto | RefreshErrorDto> {
    try {
      // const decodedToken = await this.decode(refreshToken);
      const decodedToken = refreshToken

      const body = new URLSearchParams({
        grant_type: 'refresh_token',
        // client_id: process.env.MEDPLUM_CLIENT_ID,
        // client_secret: process.env.MEDPLUM_CLIENT_SECRET,
        refresh_token: decodedToken,
      });

      const res = await firstValueFrom(
        this.http.post(`${this.medplumUrl}/oauth2/token`, body.toString(), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        }),
      );

      return plainToInstance(RefreshResponseDto, res.data, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      return plainToInstance(RefreshErrorDto, error, {
        excludeExtraneousValues: true,
      });
    }
  }
}
