import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, RequestMethod } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { SimpleExceptionFilter } from './utils/simple-exception.filter';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'], // ← Wszystkie levele
  });

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') || [
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
    .addBearerAuth()
    .build();

  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  app.setGlobalPrefix('api', {
    exclude: [
      { path: 'swagger', method: RequestMethod.ALL },
      { path: 'fhir', method: RequestMethod.ALL },
      { path: 'fhir/*path', method: RequestMethod.ALL },
      { path: 'public-api/*path', method: RequestMethod.ALL },
    ],
  });
  // app.useGlobalFilters(new SimpleExceptionFilter());
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('swagger', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3003;
  await app.listen(port);
  logger.log(`✅ Server running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
