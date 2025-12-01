import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SimpleExceptionFilter } from './utils/simple-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    //frontend url, super-admin url, thingsboard url (for rulechain to post)
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://localhost:8088',
    ],
    credentials: true,
  });
  const config = new DocumentBuilder()
    .setTitle('Proxy API')
    .setDescription('API for Proxy')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.use(cookieParser());

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'swagger', method: RequestMethod.ALL },
      { path: 'fhir', method: RequestMethod.ALL },
      { path: 'fhir/*path', method: RequestMethod.ALL },
      { path: 'public-api/*path', method: RequestMethod.ALL },
    ],
  });
  app.useGlobalFilters(new SimpleExceptionFilter());

  await app.listen(process.env.PORT ?? 3003);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
