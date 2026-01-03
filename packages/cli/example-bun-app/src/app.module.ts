import { Module } from '@harpy-js/core/runtime';
import { HomeModule } from './features/home/home.module';
import { createI18nModule } from '@harpy-js/i18n/runtime';
import { getDictionary } from './i18n/dictionaries';

@Module({
  imports: [
    HomeModule,
    createI18nModule({
      options: {
        defaultLocale: 'en',
        locales: ['en', 'es', 'pt'],
        urlPattern: 'query',
        queryParam: 'lang',
        cookieName: 'locale',
        detectFromAll: true,
      },
      dictionaryLoader: getDictionary,
    }),
  ],
})
export class AppModule {}
