import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import { AppModule } from './app.module';
import { RolesGuard } from './utils/guards/roles.guard';
import { SuccessResponseInterceptor } from './utils/interceptors/success-response.interceptor';
import { SentryFilter } from './utils/sentry-filter.utils';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  Sentry.init({
    dsn: 'https://18b885a3cd1b64525e52dd787bd51903@o4506136204541952.ingest.sentry.io/4506136210178048',
    integrations: [
      nodeProfilingIntegration(),
      new Sentry.Integrations.Prisma({ client: PrismaClient }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
  });

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryFilter(httpAdapter));

  app.useGlobalInterceptors(new SuccessResponseInterceptor());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Guards Roles
  app.useGlobalGuards(new RolesGuard(app.get(Reflector)));

  // CORS
  app.enableCors({
    origin: '*',
  });

  const config = new DocumentBuilder()
    .setTitle('Online Classroom PENS V1')
    .setVersion('1.30')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs/api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      defaultModelsExpandDepth: -1,
      filter: true,
    },
  });

  app.use('/api/streaming/webhook', express.raw({ type: '*/*' }));

  await app.listen(3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
