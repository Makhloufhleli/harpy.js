import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { withJsxEngine } from '@hepta-solutions/harpy-core';
import DefaultLayout from './core/views/layout';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Set up JSX rendering engine
  withJsxEngine(app, DefaultLayout);

  // Register static file serving
  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(require('@fastify/static'), {
    root: path.join(process.cwd(), 'dist'),
    prefix: '/',
    decorateReply: false,
  });

  await app.listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: '0.0.0.0',
  });

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
