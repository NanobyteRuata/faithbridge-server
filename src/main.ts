import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './core/interceptors/response/response.interceptor';
import { ExceptionsFilter } from './core/filters/exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new ExceptionsFilter());

  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
