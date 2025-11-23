import { Module } from '@nestjs/common';
import * as path from 'path';
import { AboutModule } from './about/about.module';
import { HomeModule } from './home/home.module';

@Module({
  imports: [HomeModule, AboutModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: any) {
    const fastify = consumer.getHttpAdapter().getInstance();

    // Serve static files (chunks, styles, assets)
    fastify.register(require('@fastify/static'), {
      root: path.join(process.cwd(), 'dist'),
      prefix: '/',
      decorateReply: false,
    });
  }
}
