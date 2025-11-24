import { Module, type NestModule } from '@nestjs/common';
import { HomeModule } from './features/home/home.module';
import { AboutModule } from './features/about/about.module';
import { AuthModule } from './features/auth/auth.module';
import { DashboardModule } from './features/dashboard/dashboard.module';

@Module({
  imports: [HomeModule, AboutModule, AuthModule, DashboardModule],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure() {
    // Static file serving is configured in main.ts
  }
}
