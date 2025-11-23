import { Module, type NestModule } from '@nestjs/common';
import { HomeModule } from './home/home.module';
import { AboutModule } from './about/about.module';
import * as path from 'path';

@Module({
  imports: [HomeModule, AboutModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure() {
    // Static file serving is configured in main.ts
  }
}
