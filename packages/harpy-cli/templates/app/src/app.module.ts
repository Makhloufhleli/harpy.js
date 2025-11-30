import { Module } from '@nestjs/common';
import { I18nModule } from '@hepta-solutions/harpy-i18n';
import { HomeModule } from './features/home/home.module';
import { AboutModule } from './features/about/about.module';
import { AuthModule } from './features/auth/auth.module';
import { DashboardModule } from './features/dashboard/dashboard.module';
import { i18nConfig } from './i18n/i18n.config';

@Module({
  imports: [
    // Configure I18n module (from separate package)
    I18nModule.forRoot(i18nConfig),
    HomeModule,
    AboutModule,
    AuthModule,
    DashboardModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
