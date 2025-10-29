import { All, Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { Proxy } from './proxy/proxy';

import type { Request, Response } from 'express';

@Controller('fhir')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly proxy: Proxy,
  ) {}

  @Get('hello')
  getHello(): string {
    console.log('hello');
    return 'Hello World!';
  }

  @All('*')
  async handleFhirRequests(@Req() req: Request, @Res() res: Response) {
    const medplum = await this.proxy.initMedplum();
    const accessToken = medplum.getAccessToken();

    const targetUrl = `${process.env.MEDPLUM_URL}${req.url.replace(/^\/fhir/, '')}`;
    const method = req.method;

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
