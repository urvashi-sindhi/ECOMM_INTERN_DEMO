import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AppLogger } from './libs/helpers/logger';
import { Messages } from './libs/utility/constants/message';
import * as dotenv from 'dotenv';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionFilter } from './libs/helpers/exception.filter';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix('api');
  const logger = new AppLogger();
  app.useLogger(logger);
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      skipMissingProperties: false,
    }),
  );

  app.useStaticAssets(join(__dirname, '..', 'uploads'), { prefix: '/uploads' });

  const adapter = app.get(HttpAdapterHost).httpAdapter;
  app.useGlobalFilters(new AllExceptionFilter(adapter));

  const config = new DocumentBuilder()
    .setTitle(' E-Commerce ')
    .setDescription('API documentation of e-commerce')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
  logger.log(`${Messages.SERVER_LISTEN} ${PORT} `);
}
bootstrap();
