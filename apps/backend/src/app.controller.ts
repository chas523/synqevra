import { All, Controller, Get, Logger, Req, Res } from '@nestjs/common';

import type { Request, Response } from 'express';
import { MedplumClientFactory } from './medplum/application/medplum-client.factory';
import { ActiveUser } from './auth/decorators/active-user.decorator';
import type { CurrentUser } from './auth/types/current-user';
import { ApiTags } from '@nestjs/swagger';

@ApiTags(
  'Ω FHIR Proxy - used Temporarily for fetching Medplum specific Form Components (probably to be removed later)',
)
@Controller('fhir')
export class AppController {
  constructor(private readonly proxy: MedplumClientFactory) {}
  private readonly logger = new Logger(AppController.name);
  private readonly allowedPatterns = [
    /^\/R4\/StructureDefinition\/\$[\w-]+$/, // /R4/StructureDefinition/$expand-profile
    /^\/R4\/StructureDefinition\/[a-zA-Z0-9.-]+$/, // /R4/StructureDefinition/some-profile-id
    /^\/R4\/StructureDefinition$/, // /R4/StructureDefinition (GET collection)
    /^\/R4\/Binary$/, // /R4/Binary (POST new binary resource)
    /^\/R4\/Binary\/[a-zA-Z0-9-]+$/, // /R4/Binary/{id} (GET/PUT specific binary)
  ];

  @Get('hello')
  getHello(): string {
    return 'Hello World!';
  }

  @All('*')
  async handleFhirRequests(
    @Req() req: Request,
    @Res() res: Response,
    @ActiveUser() user: CurrentUser,
  ) {
    // ← DEBUG LOGI
    this.logger.log(`=== FHIR Request ===`);
    this.logger.log(`Method: ${req.method}`);
    this.logger.log(`URL: ${req.url}`);
    this.logger.log(`Path: ${req.path}`);

    try {
      const medplum = await this.proxy.initMedplum(user.id);
      const accessToken = medplum.getAccessToken();

      const cleanPath = req.url.replace(/^(\/fhir)+/, '').split('?')[0];
      const targetUrl = `${process.env.MEDPLUM_URL}${req.url.replace(/^\/fhir/, '')}`;
      const method = req.method;

      this.logger.log(`Clean path: ${cleanPath}`);
      this.logger.log(`Target URL: ${targetUrl}`);

      //validate allowed patterns
      const isAllowed = this.allowedPatterns.some((pattern) =>
        pattern.test(cleanPath),
      );

      if (!isAllowed) {
        this.logger.warn(`Path not allowed: ${cleanPath}`);
        return res.status(403).send({
          statusCode: 403,
          error: 'Forbidden',
          message: 'The requested URL is not allowed.',
        });
      }

      //we need to differentiate between application/json and image/png
      const contentType = req.headers['content-type'] || '';
      const isJson = contentType.includes('application/json');

      let body: any;

      //for GET requests
      if (method === 'GET' || method === 'HEAD') {
        body = undefined;
        //for requests with BODY (POST)
      } else if (isJson) {
        body = JSON.stringify(req.body);
        //for requests with ex. image/png content type
      } else {
        const chunks: Buffer[] = [];
        await new Promise<void>((resolve, reject) => {
          req.on('data', (chunk) => chunks.push(chunk));
          req.on('end', () => resolve());
          req.on('error', (err) => reject(err));
        });
        body = Buffer.concat(chunks);
      }

      this.logger.log(`Sending request to Medplum...`);

      //omit invalid headers (host & content-length)
      const headers = Object.fromEntries(
        Object.entries(req.headers).filter(
          ([k]) =>
            ![
              'host',
              'content-length',
              'cookie',
              'authorization',
              'origin',
            ].includes(k.toLowerCase()),
        ),
      );

      const fhirResponse = await fetch(targetUrl, {
        method,
        headers: {
          ...headers,
          Authorization: `Bearer ${accessToken}`,
        },
        body,
      });

      this.logger.log(`Medplum response status: ${fhirResponse.status}`);

      const responseBody = await fhirResponse.clone().text();
      this.logger.log(`Medplum response body: `, responseBody);

      //we omit content-encoding header because the data is already decoded (instead we'll get ERR_CONTENT_DECODING_FAILED)
      const hopByHopHeaders = new Set([
        'connection',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'transfer-encoding',
        'upgrade',
        'content-length',
        'content-encoding',
      ]);

      for (const [key, value] of fhirResponse.headers.entries()) {
        if (!hopByHopHeaders.has(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      }

      //we have to use . arrayBuffer, because apart from application/json we may get image/png
      const responseBuffer = await fhirResponse.arrayBuffer();
      res.status(fhirResponse.status).send(Buffer.from(responseBuffer));
    } catch (error) {
      this.logger.error(`Error handling FHIR request: `, error);
      res
        .status(500)
        .send({ msg: 'Internal Server Error', error: String(error) });
    }
  }
}
