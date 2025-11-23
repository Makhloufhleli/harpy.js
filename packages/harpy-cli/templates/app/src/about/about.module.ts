import { Module } from '@nestjs/common';
import { HomeService } from '../home/home.service';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';

@Module({
  imports: [],
  controllers: [AboutController],
  providers: [AboutService, HomeService],
})
export class AboutModule {}
