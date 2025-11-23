import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { withJsxEngine } from 'nestjsx-core';
import DefaultLayout from './core/views/layout';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Set up JSX rendering engine
  withJsxEngine(app, DefaultLayout);

  await app.listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: '0.0.0.0',
  });

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
