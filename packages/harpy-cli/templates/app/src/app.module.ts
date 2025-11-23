import { Module, type MiddlewareConsumer } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import * as path from 'path';
import type { FastifyInstance } from 'fastify';

@Module({
  imports: [HomeModule, AboutModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    const fastify = consumer
      .getHttpAdapter()
      .getInstance() as FastifyInstance;

    // Serve static files (chunks, styles, assets)
    fastify.register(require('@fastify/static'), {
      root: path.join(process.cwd(), 'dist'),
      prefix: '/',
      decorateReply: false,
    });
  }
}
