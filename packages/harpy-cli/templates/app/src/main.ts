import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { withJsxEngine } from '@hepta-solutions/harpy-core';
import DefaultLayout from './layouts/layout';
import * as path from 'path';
import fastifyStatic from '@fastify/static';
import fastifyCookie from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Set up JSX rendering engine
  withJsxEngine(app, DefaultLayout);

  // Register Fastify plugins
  const fastify = app.getHttpAdapter().getInstance();
  
  // Register cookie support for i18n
  await fastify.register(fastifyCookie);
  
  // Register static file serving
  await fastify.register(fastifyStatic, {
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
