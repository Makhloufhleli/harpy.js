import 'reflect-metadata';
import { HarpyApp } from '@harpy-js/core/runtime';
import { AppModule } from './app.module';
import { createI18nMiddleware, I18nService } from '@harpy-js/i18n/runtime';
import { getDictionary } from './i18n/dictionaries';

async function bootstrap() {
  const app = await HarpyApp.create(AppModule);
  
  // Register dictionary loader
  I18nService.registerDictionaryLoader(getDictionary);
  
  // Enable CORS for development
  app.enableCors();
  
  // Serve static files from public directory
  app.useStatic('/public', './public');
  
  // Add i18n middleware - detects locale from path, query, header, or cookie
  app.use(createI18nMiddleware({
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt'],
    urlPattern: 'query',
    queryParam: 'lang',
    headerName: 'x-lang',
    cookieName: 'locale',
    detectFromAll: true,
  }));
  
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
  
  console.log(`🚀 Harpy app running at http://localhost:${port}`);
}

bootstrap();
