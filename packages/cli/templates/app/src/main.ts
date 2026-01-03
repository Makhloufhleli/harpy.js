import 'reflect-metadata';
import { HarpyApp } from '@harpy-js/core/runtime';
import { createI18nMiddleware, I18nService } from '@harpy-js/i18n/runtime';
import { AppModule } from './app.module';
import { getDictionary } from './i18n/dictionaries';

async function bootstrap() {
  const app = await HarpyApp.create(AppModule);
  
  // Register dictionary loader for i18n
  I18nService.registerDictionaryLoader(getDictionary);
  
  // Enable CORS for development
  app.enableCors();
  
  // Serve static files from public directory
  app.useStatic('/public', './public');
  
  // Add i18n middleware - detects locale from path, query, header, or cookie
  app.use(createI18nMiddleware({
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt'],
    urlPattern: 'query', // Primary pattern, but detectFromAll allows all methods
    queryParam: 'lang',
    headerName: 'x-lang',
    cookieName: 'locale',
    detectFromAll: true, // Allow path, query, header detection
  }));
  
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
  
  console.log(`🚀 Harpy app running at http://localhost:${port}`);
}

bootstrap();
