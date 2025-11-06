import { All, Controller, Get, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { MedplumConnectionService } from './connection/medplum-connection.service';
import { ActiveUser } from './auth/decorators/active-user.decorator';
import type { CurrentUser } from './auth/types/current-user';

@Controller('fhir')
export class AppController {
  constructor(private readonly proxy: MedplumConnectionService) {}

  private readonly allowedPatterns = [
    /^\/R4\/StructureDefinition\/\$[\w-]+$/, // /R4/StructureDefinition/$expand-profile
    /^\/R4\/StructureDefinition\/[a-zA-Z0-9.-]+$/, // /R4/StructureDefinition/some-profile-id
    /^\/R4\/StructureDefinition$/, // /R4/StructureDefinition (GET collection)
    /^\/R4\/Binary$/, // /R4/Binary (POST new binary resource)
    /^\/R4\/Binary\/[a-zA-Z0-9-]+$/, // /R4/Binary/{id} (GET/PUT specific binary)
  ];

  @Get('hello')
  getHello(): string {
    console.log('hello');
    return 'Hello World!';
  }

  @All('*')
  async handleFhirRequests(
    @Req() req: Request,
    @Res() res: Response,
    @ActiveUser() user: CurrentUser,
  ) {
    const medplum = await this.proxy.initMedplum(user.id);
    const accessToken = medplum.getAccessToken();

    const cleanPath = req.url.replace(/^(\/fhir)+/, '').split('?')[0];
    const targetUrl = `${process.env.MEDPLUM_URL}${req.url.replace(/^\/fhir/, '')}`;
    const method = req.method;

    //validate allowed patterns
    const isAllowed = this.allowedPatterns.some((pattern) =>
      pattern.test(cleanPath),
    );
    if (!isAllowed) {
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

    //omit invalid headers (host & content-length)
    const fhirResponse = await fetch(targetUrl, {
      method,
      headers: {
        ...Object.fromEntries(
          Object.entries(req.headers).filter(
            ([k]) => !['host', 'content-length'].includes(k.toLowerCase()),
          ),
        ),
        Authorization: `Bearer ${accessToken}`,
      },
      body,
    });

    //we omit content-encoding header because the data is already decoded (instead we'll get ERR_CONTENT_DECODING_FAILED)
    for (const [key, value] of fhirResponse.headers.entries()) {
      if (key.toLowerCase() !== 'content-encoding') {
        res.setHeader(key, value);
      }
    }

    //we have to use .arrayBuffer, because apart of application/json we may get image/png
    const responseBuffer = await fhirResponse.arrayBuffer();
    res.status(fhirResponse.status).send(Buffer.from(responseBuffer));
  }
}
