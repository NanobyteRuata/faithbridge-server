import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './core/filters/prisma-client-exception/prisma-client-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './core/interceptors/response/response.interceptor';
import { AllExceptionsFilter } from './core/filters/all-exceptions/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    new PrismaClientExceptionFilter(httpAdapter),
    new AllExceptionsFilter(),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(process.env.APP_PORT ?? 3000);
}
bootstrap();
