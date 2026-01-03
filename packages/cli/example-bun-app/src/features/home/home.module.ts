import { Module } from '@harpy-js/core/runtime';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
