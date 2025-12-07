import { Module } from '@nestjs/common';
import { I18nModule } from '@harpy-js/i18n';
import { HomeModule } from './features/home/home.module';
import { i18nConfig } from './i18n/i18n.config';

@Module({
  imports: [
    // Configure I18n module (from separate package)
    I18nModule.forRoot(i18nConfig),
    HomeModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
