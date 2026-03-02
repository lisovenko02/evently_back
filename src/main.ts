import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.NEXT_URL,
    methods: 'GET,POST,PATCH,PUT,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => {
          const [firstConstraint] = Object.values(error.constraints || {});
          return `${error.property}: ${firstConstraint || 'Invalid value'}`;
        });
        return new BadRequestException(messages);
      },
    }),
  );

  app.use(cookieParser());

  app.use((req, res, next) => {
    console.log('Incoming request:', req.method, req.url);
    next();
  });

  await app.listen(process.env.PORT ?? 4200);
}
bootstrap();
