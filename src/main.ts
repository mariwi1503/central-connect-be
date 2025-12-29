import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { corsWhitelist } from './common/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const appPort = configService.getOrThrow('APP_PORT');

  app.setGlobalPrefix('api');

  // versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1', // set default version to '1' so for api v1 no need to declare it to each controllers or routes
  });

  // cors
  app.enableCors({
    // origin: corsWhitelist,
    // credentials: true,
  });

  // handle all user input validation globally
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const config = new DocumentBuilder()
    .setTitle('Central Connect API')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, documentFactory, {
    customSiteTitle: 'Central Connect API',
  });

  // handler bigInt error
  // TypeError: Do not know how to serialize a BigInt
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  await app.listen(appPort);
}
bootstrap();
