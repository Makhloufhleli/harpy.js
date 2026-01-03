import chalk from "chalk";

interface CreateBunOptions {
  packageManager?: "bun";
  includeI18n?: boolean;
  examples?: boolean;
  skipInstall?: boolean;
  skipGit?: boolean;
}

/**
 * Write file using Bun API
 */
async function writeFile(filePath: string, content: string): Promise<void> {
  await Bun.write(filePath, content);
}

/**
 * Write JSON file using Bun API
 */
async function writeJsonFile(filePath: string, data: object): Promise<void> {
  await Bun.write(filePath, JSON.stringify(data, null, 2));
}

/**
 * Create directory using Bun shell
 */
async function mkdir(dirPath: string): Promise<void> {
  await Bun.$`mkdir -p ${dirPath}`.quiet();
}

/**
 * Create a Bun-native Harpy project
 */
export async function createBunProject(
  projectName: string,
  projectPath: string,
  options: CreateBunOptions,
) {
  const startTime = Date.now();
  const includeI18n = options.includeI18n ?? false;

  // Step 1: Create project directories
  await mkdir(projectPath);
  await mkdir(`${projectPath}/src`);
  await mkdir(`${projectPath}/src/features/home/views`);
  await mkdir(`${projectPath}/src/layouts`);
  await mkdir(`${projectPath}/src/components`);
  await mkdir(`${projectPath}/src/assets`);
  await mkdir(`${projectPath}/public`);

  if (includeI18n) {
    await mkdir(`${projectPath}/src/dictionaries`);
    await mkdir(`${projectPath}/src/i18n`);
  }

  // Step 2: Create package.json
  console.log(chalk.green("[CREATE]") + " package.json");
  const packageJson: Record<string, any> = {
    name: projectName,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts: {
      "build:css": "bun ./node_modules/@harpy-js/core/scripts/build-css.ts",
      "build:hydration": "bun ./node_modules/@harpy-js/core/scripts/build-hydration.ts",
      "prebuild": "bun run build:css && bun run build:hydration",
      "dev": "bun run build:css && bun run build:hydration && bun --watch src/main.ts",
      "build": "bun run prebuild && bun build src/main.ts --outdir dist --target bun",
      "start": "bun dist/main.js",
    },
    dependencies: {
      "@harpy-js/core": "workspace:*",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
      "reflect-metadata": "^0.2.0",
    },
    devDependencies: {
      "@harpy-js/cli": "workspace:*",
      "@types/bun": "^1.2.7",
      "@types/react": "^19.2.2",
      "@types/react-dom": "^19.2.2",
      typescript: "^5.7.2",
      tailwindcss: "^4.0.0",
    },
  };

  if (includeI18n) {
    packageJson.dependencies["@harpy-js/i18n"] = "workspace:*";
  }

  await writeJsonFile(`${projectPath}/package.json`, packageJson);

  // Step 3: Create tsconfig.json
  console.log(chalk.green("[CREATE]") + " tsconfig.json");
  const tsconfig = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      lib: ["ES2022", "DOM"],
      jsx: "react-jsx",
      jsxImportSource: "react",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      types: ["bun"],
      outDir: "./dist",
      rootDir: "./src",
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"],
  };
  await writeJsonFile(`${projectPath}/tsconfig.json`, tsconfig);

  // Step 4: Create app.module.ts
  console.log(chalk.green("[CREATE]") + " src/app.module.ts");
  const appModuleTs = `import { Module } from '@harpy-js/core/runtime';
import { HomeModule } from './features/home/home.module';
${includeI18n ? `import { createI18nModule } from '@harpy-js/i18n/runtime';
import { getDictionary } from './i18n/dictionaries';` : ''}

@Module({
  imports: [
    HomeModule,
${includeI18n ? `    createI18nModule({
      options: {
        defaultLocale: 'en',
        locales: ['en', 'es', 'pt'],
        urlPattern: 'query',
        queryParam: 'lang',
        cookieName: 'locale',
        detectFromAll: true,
      },
      dictionaryLoader: getDictionary,
    }),` : ''}
  ],
})
export class AppModule {}
`;
  await writeFile(`${projectPath}/src/app.module.ts`, appModuleTs);

  // Step 5: Create main.ts
  console.log(chalk.green("[CREATE]") + " src/main.ts");
  const mainTs = `import 'reflect-metadata';
import { HarpyApp } from '@harpy-js/core/runtime';
import { AppModule } from './app.module';
${includeI18n ? `import { createI18nMiddleware, I18nService } from '@harpy-js/i18n/runtime';
import { getDictionary } from './i18n/dictionaries';` : ''}

async function bootstrap() {
  const app = await HarpyApp.create(AppModule);
  
${includeI18n ? `  // Register dictionary loader
  I18nService.registerDictionaryLoader(getDictionary);
  ` : ''}
  // Enable CORS for development
  app.enableCors();
  
  // Serve static files from public directory
  app.useStatic('/public', './public');
  
${includeI18n ? `  // Add i18n middleware - detects locale from path, query, header, or cookie
  app.use(createI18nMiddleware({
    defaultLocale: 'en',
    locales: ['en', 'es', 'pt'],
    urlPattern: 'query',
    queryParam: 'lang',
    headerName: 'x-lang',
    cookieName: 'locale',
    detectFromAll: true,
  }));` : ''}
  
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  await app.listen(port);
  
  console.log(\`🚀 Harpy app running at http://localhost:\${port}\`);
}

bootstrap();
`;
  await writeFile(`${projectPath}/src/main.ts`, mainTs);

  // Step 6: Create home.service.ts
  console.log(chalk.green("[CREATE]") + " src/features/home/home.service.ts");
  const homeServiceTs = `import { Injectable } from '@harpy-js/core/runtime';

@Injectable()
export class HomeService {
  getWelcomeMessage(): string {
    return 'Welcome to Harpy.js on Bun!';
  }
}
`;
  await writeFile(`${projectPath}/src/features/home/home.service.ts`, homeServiceTs);

  // Step 7: Create home.controller.ts
  console.log(chalk.green("[CREATE]") + " src/features/home/home.controller.ts");
  const homeControllerTs = `import { Controller, Get, JsxRender, WithLayout } from '@harpy-js/core/runtime';
import { HomeService } from './home.service';
import HomePage from './views/homepage';
import { Layout } from '../../layouts/layout';
${includeI18n ? `import { CurrentLocale } from '@harpy-js/i18n/runtime';
import { getDictionary } from '../../i18n/dictionaries';` : ''}

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('/')
  @JsxRender(HomePage)
  @WithLayout(Layout)
  async homepage(${includeI18n ? '@CurrentLocale() locale: string' : ''}): Promise<Record<string, any>> {
${includeI18n ? `    const dict = await getDictionary(locale);
    return {
      message: this.homeService.getWelcomeMessage(),
      locale,
      t: dict,
    };` : `    return {
      message: this.homeService.getWelcomeMessage(),
    };`}
  }
}
`;
  await writeFile(`${projectPath}/src/features/home/home.controller.ts`, homeControllerTs);

  // Step 8: Create home.module.ts
  console.log(chalk.green("[CREATE]") + " src/features/home/home.module.ts");
  const homeModuleTs = `import { Module } from '@harpy-js/core/runtime';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';

@Module({
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
`;
  await writeFile(`${projectPath}/src/features/home/home.module.ts`, homeModuleTs);

  // Step 9: Create homepage view
  console.log(chalk.green("[CREATE]") + " src/features/home/views/homepage.tsx");
  const homepageTsx = createHomepageContent(includeI18n);
  await writeFile(`${projectPath}/src/features/home/views/homepage.tsx`, homepageTsx);

  // Step 10: Create layout
  console.log(chalk.green("[CREATE]") + " src/layouts/layout.tsx");
  const layoutTsx = createLayoutContent(includeI18n);
  await writeFile(`${projectPath}/src/layouts/layout.tsx`, layoutTsx);

  // Step 11: Create Logo component
  console.log(chalk.green("[CREATE]") + " src/components/logo.tsx");
  const logoTsx = createLogoContent();
  await writeFile(`${projectPath}/src/components/logo.tsx`, logoTsx);

  // Step 12: Create global CSS
  console.log(chalk.green("[CREATE]") + " src/assets/global.css");
  await writeFile(`${projectPath}/src/assets/global.css`, `@import "tailwindcss";\n`);

  // Step 13: Create tailwind config
  console.log(chalk.green("[CREATE]") + " tailwind.config.js");
  await writeFile(`${projectPath}/tailwind.config.js`, `/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{ts,tsx}'],
};
`);

  // Step 14: Create .gitignore
  console.log(chalk.green("[CREATE]") + " .gitignore");
  await writeFile(`${projectPath}/.gitignore`, `node_modules
dist
.harpy
.DS_Store
*.log
.env
.env.local
`);

  // Step 15: Create README
  console.log(chalk.green("[CREATE]") + " README.md");
  await writeFile(`${projectPath}/README.md`, createReadmeContent(projectName, includeI18n));

  // Step 16: Create i18n files if enabled
  if (includeI18n) {
    console.log(chalk.green("[CREATE]") + " i18n configuration");
    
    await writeFile(`${projectPath}/src/i18n/dictionaries.ts`, `const cache = new Map<string, Record<string, any>>();

export async function getDictionary(locale: string): Promise<Record<string, any>> {
  if (cache.has(locale)) {
    return cache.get(locale)!;
  }
  
  try {
    const dict = await import(\`../dictionaries/\${locale}.json\`);
    const result = dict.default || dict;
    cache.set(locale, result);
    return result;
  } catch (error) {
    console.warn(\`[I18n] Failed to load dictionary for locale "\${locale}", falling back to "en"\`);
    if (cache.has('en')) {
      return cache.get('en')!;
    }
    const dict = await import('../dictionaries/en.json');
    const result = dict.default || dict;
    cache.set('en', result);
    return result;
  }
}
`);

    await writeJsonFile(`${projectPath}/src/dictionaries/en.json`, {
      hero: {
        title: "Harpy.js",
        subtitle: "Full-Stack Framework with Bun & React SSR",
        description: "Build blazing-fast full-stack applications with Bun runtime, React server-side rendering, and automatic hydration.",
        cta: { getStarted: "Get Started", viewDocs: "View Docs" },
      },
      features: {
        fast: { title: "Blazing Fast", description: "Built on Bun runtime for maximum performance" },
        ssr: { title: "React SSR", description: "Server-side rendering with automatic hydration" },
        dx: { title: "Great DX", description: "TypeScript-first with decorators like NestJS" },
      },
    });

    await writeJsonFile(`${projectPath}/src/dictionaries/es.json`, {
      hero: {
        title: "Harpy.js",
        subtitle: "Framework Full-Stack con Bun y React SSR",
        description: "Crea aplicaciones full-stack ultrarrápidas con Bun, renderizado del lado del servidor con React e hidratación automática.",
        cta: { getStarted: "Comenzar", viewDocs: "Ver Docs" },
      },
      features: {
        fast: { title: "Ultra Rápido", description: "Construido sobre Bun para máximo rendimiento" },
        ssr: { title: "React SSR", description: "Renderizado del servidor con hidratación automática" },
        dx: { title: "Gran DX", description: "TypeScript-first con decoradores como NestJS" },
      },
    });

    await writeJsonFile(`${projectPath}/src/dictionaries/pt.json`, {
      hero: {
        title: "Harpy.js",
        subtitle: "Framework Full-Stack com Bun e React SSR",
        description: "Construa aplicações full-stack ultrarrápidas com Bun, renderização do lado do servidor com React e hidratação automática.",
        cta: { getStarted: "Começar", viewDocs: "Ver Docs" },
      },
      features: {
        fast: { title: "Ultra Rápido", description: "Construído sobre Bun para máximo desempenho" },
        ssr: { title: "React SSR", description: "Renderização do servidor com hidratação automática" },
        dx: { title: "Ótima DX", description: "TypeScript-first com decoradores como NestJS" },
      },
    });
  }

  // Step 17: Install dependencies using Bun
  if (!options.skipInstall) {
    console.log(chalk.green("[INSTALL]") + " Dependencies");
    await Bun.$`cd ${projectPath} && bun install`.quiet();
  } else {
    console.log(chalk.yellow("⚠ Skipping dependency installation (--skip-install)"));
  }

  // Step 18: Initialize git
  if (!options.skipGit) {
    console.log(chalk.green("[GIT]") + " Initializing repository");
    await Bun.$`cd ${projectPath} && git init && git add . && git commit -m "Initial commit from harpy-cli"`.quiet();
  } else {
    console.log(chalk.yellow("⚠ Skipping git initialization (--skip-git)"));
  }

  // Display creation time
  const duration = Date.now() - startTime;
  const seconds = (duration / 1000).toFixed(2);
  console.log("");
  console.log(chalk.green("⏱") + `  Project created in ${chalk.cyan(seconds + "s")}`);
}

function createHomepageContent(includeI18n: boolean): string {
  return `import React from 'react';
import Logo from '../../../components/logo';

interface HomePageProps {
  message: string;
${includeI18n ? `  locale: string;
  t: Record<string, any>;` : ''}
}

export default function HomePage({ message${includeI18n ? ', locale, t' : ''} }: HomePageProps) {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto max-w-7xl px-4 pt-20 pb-32">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Logo className="w-24 h-24 sm:w-32 sm:h-32" />
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6">
            <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              ${includeI18n ? "{t?.hero?.title || 'Harpy.js'}" : "Harpy.js"}
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-4 font-light px-4">
            ${includeI18n ? "{t?.hero?.subtitle || 'Full-Stack Framework with Bun & React SSR'}" : "Full-Stack Framework with Bun & React SSR"}
          </p>

          <p className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto mb-12 px-4">
            ${includeI18n ? "{t?.hero?.description || message}" : "{message}"}
          </p>

${includeI18n ? `          <p className="text-sm text-slate-500 mb-8">
            Current locale: <span className="text-amber-400 font-mono">{locale}</span>
          </p>` : ''}

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <a href="https://harpyjs.org" target="_blank" rel="noopener noreferrer" 
               className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-2xl shadow-orange-500/25 transition-all hover:shadow-orange-500/40 hover:scale-105 text-lg">
              Get Started
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
            <a href="https://github.com/AcroBytes/harpy.js" target="_blank" rel="noopener noreferrer"
               className="group inline-flex items-center gap-2 px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-white font-bold rounded-xl shadow-xl transition-all hover:scale-105 text-lg backdrop-blur-sm">
              GitHub
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="group p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-amber-500/30 transition-all hover:bg-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-2">${includeI18n ? "{t?.features?.fast?.title || 'Blazing Fast'}" : "Blazing Fast"}</h3>
              <p className="text-slate-400">${includeI18n ? "{t?.features?.fast?.description || 'Built on Bun runtime'}" : "Built on Bun runtime for maximum performance"}</p>
            </div>
            <div className="group p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-purple-500/30 transition-all hover:bg-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-2">${includeI18n ? "{t?.features?.ssr?.title || 'React SSR'}" : "React SSR"}</h3>
              <p className="text-slate-400">${includeI18n ? "{t?.features?.ssr?.description || 'Server-side rendering'}" : "Server-side rendering with automatic hydration"}</p>
            </div>
            <div className="group p-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 hover:border-cyan-500/30 transition-all hover:bg-slate-800/50">
              <h3 className="text-xl font-bold text-white mb-2">${includeI18n ? "{t?.features?.dx?.title || 'Great DX'}" : "Great DX"}</h3>
              <p className="text-slate-400">${includeI18n ? "{t?.features?.dx?.description || 'TypeScript-first'}" : "TypeScript-first with decorators like NestJS"}</p>
            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: \`
        @keyframes blob { 0% { transform: translate(0px, 0px) scale(1); } 33% { transform: translate(30px, -50px) scale(1.1); } 66% { transform: translate(-20px, 20px) scale(0.9); } 100% { transform: translate(0px, 0px) scale(1); } }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      \` }} />
    </div>
  );
}
`;
}

function createLayoutContent(includeI18n: boolean): string {
  return `import React from 'react';
import Logo from '../components/logo';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Harpy.js App</title>
        <meta name="description" content="A blazing-fast full-stack framework built on Bun with React SSR" />
        <link rel="stylesheet" href="/_harpy/styles.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-slate-900 min-h-screen font-[Inter,system-ui,sans-serif] antialiased">
        <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
          <div className="container mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="flex items-center gap-3 text-white font-bold text-xl hover:opacity-80 transition-opacity">
                <Logo className="w-8 h-8" />
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Harpy.js</span>
              </a>
              <nav className="flex items-center gap-6">
                <a href="https://harpyjs.org" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">Docs</a>
                <a href="https://github.com/AcroBytes/harpy.js" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">GitHub</a>
${includeI18n ? `                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-700">
                  <a href="?lang=en" className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">EN</a>
                  <a href="?lang=es" className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">ES</a>
                  <a href="?lang=pt" className="px-2 py-1 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-all">PT</a>
                </div>` : ''}
              </nav>
            </div>
          </div>
        </header>

        <main id="app" className="pt-16">
          {children}
        </main>

        <footer className="bg-slate-950 border-t border-slate-800">
          <div className="container mx-auto max-w-7xl px-4 py-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <Logo className="w-6 h-6" />
                <span className="text-slate-400 text-sm">Built with Harpy.js on Bun</span>
              </div>
              <div className="flex items-center gap-6">
                <a href="https://harpyjs.org" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-500 text-sm transition-colors">Documentation</a>
                <a href="https://github.com/AcroBytes/harpy.js" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-500 text-sm transition-colors">GitHub</a>
                <a href="https://bun.sh" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-amber-500 text-sm transition-colors">Bun</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
              <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Harpy.js. Open source under MIT License.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
`;
}

function createLogoContent(): string {
  return `import React from 'react';

interface LogoProps {
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  return (
    <svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500.000000 500.000000" preserveAspectRatio="xMidYMid meet" className={className}>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="50%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <g transform="translate(0,500) scale(0.1,-0.1)" fill="url(#grad1)" stroke="none">
        <path d="M2690 4639 c-343 -44 -477 -66 -659 -110 -418 -100 -745 -238 -944 -399 -103 -83 -154 -155 -162 -230 -10 -84 -11 -85 -83 -115 -238 -100 -342 -181 -407 -316 -44 -94 -59 -171 -52 -279 11 -172 97 -322 237 -415 37 -25 70 -45 72 -45 3 0 8 33 11 73 4 39 12 89 19 109 14 40 76 133 84 125 3 -2 -6 -34 -20 -71 l-25 -66 49 25 c137 69 288 102 388 84 156 -29 254 -146 289 -347 12 -71 13 -102 4 -170 -15 -104 -60 -244 -108 -331 -107 -195 -319 -403 -547 -536 -36 -21 -64 -41 -62 -43 9 -8 206 21 297 43 170 42 287 96 442 202 43 29 81 53 84 53 12 0 -164 -293 -186 -310 -4 -3 -28 -32 -53 -65 -76 -99 -282 -293 -388 -365 -19 -13 -37 -27 -40 -30 -10 -13 -129 -89 -232 -150 -60 -34 -108 -64 -108 -67 0 -7 228 7 375 23 524 58 982 267 1409 642 58 51 106 89 106 84 0 -14 -106 -169 -165 -243 -278 -345 -712 -656 -1190 -852 -120 -49 -365 -128 -459 -147 -32 -6 -54 -15 -50 -20 17 -14 241 -30 435 -30 586 1 1056 118 1480 370 86 51 260 174 301 213 58 54 160 139 163 135 8 -8 -84 -221 -134 -309 -28 -49 -51 -91 -51 -94 0 -20 202 139 281 221 283 295 410 675 355 1064 -68 488 -320 886 -740 1169 -98 66 -366 201 -366 184 0 -3 15 -26 33 -52 85 -119 153 -262 184 -391 26 -108 25 -374 -1 -485 -99 -417 -491 -864 -953 -1086 -57 -28 -107 -49 -110 -46 -2 3 17 24 44 48 146 129 328 335 430 489 89 133 191 350 232 494 10 33 21 55 24 49 4 -6 12 -53 18 -104 5 -52 13 -114 17 -139 l7 -45 18 55 c47 140 51 164 51 310 0 124 -3 156 -23 220 -83 268 -237 453 -456 550 -27 12 -57 25 -66 30 -9 4 -65 20 -125 35 -60 15 -113 30 -117 34 -4 4 34 15 85 25 51 9 129 25 173 35 l80 18 -35 11 c-82 26 -177 35 -334 29 -239 -9 -433 -56 -642 -158 -138 -67 -215 -145 -238 -241 -3 -16 -10 -28 -15 -28 -16 0 -63 122 -74 190 -13 84 1 176 37 256 48 105 184 210 343 265 83 28 107 25 156 -20 46 -42 183 -141 195 -141 4 0 13 9 20 20 11 19 24 20 190 21 105 1 162 4 139 9 -38 7 -61 20 -36 20 8 0 47 15 86 34 50 24 86 51 124 92 130 141 186 191 251 224 46 24 63 37 53 42 -31 18 -192 20 -314 4 -68 -9 -126 -14 -128 -12 -2 2 28 25 67 52 39 27 67 50 61 52 -22 7 -204 -65 -351 -139 -270 -135 -359 -146 -360 -43 -1 139 477 388 870 452 139 23 198 32 214 32 33 0 6 -17 -69 -45 -41 -15 -75 -29 -75 -32 0 -3 8 -2 18 2 43 17 269 51 441 66 116 10 175 10 303 -1 146 -12 185 -21 141 -34z" />
      </g>
    </svg>
  );
}
`;
}

function createReadmeContent(projectName: string, includeI18n: boolean): string {
  return `# ${projectName}

A Harpy.js project running on Bun runtime.

## Getting Started

\`\`\`bash
bun install
bun dev
\`\`\`

## Scripts

- \`bun dev\` - Start development server with hot reload
- \`bun run build\` - Build for production
- \`bun start\` - Start production server

## Project Structure

\`\`\`
src/
  main.ts              # Application entry point
  app.module.ts        # Root module
  features/            # Feature modules
  layouts/             # Layout components
  components/          # Shared components
  assets/              # CSS and static assets
${includeI18n ? `  i18n/                # Internationalization
  dictionaries/        # Translation files` : ''}
\`\`\`

## Learn More

- [Harpy.js Documentation](https://harpyjs.org)
- [Bun Documentation](https://bun.sh)
`;
}
