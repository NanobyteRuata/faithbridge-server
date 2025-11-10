import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security headers with helmet
  app.use(helmet());

  // Input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS configuration
  const corsOrigin = process.env.CORS_ALLOW_ORIGIN || '*';
  const allowedOrigins = corsOrigin === '*' ? '*' : corsOrigin.split(',');
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: allowedOrigins !== '*', // credentials only work with specific origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-org-code', 'x-access-code'],
  });

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
