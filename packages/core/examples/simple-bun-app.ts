/**
 * Simple Example - HarpyJS Bun Runtime
 * 
 * This is a minimal example showing how to use the new Bun-native runtime.
 * Run with: bun run apps/example-bun/src/main.ts
 */
import 'reflect-metadata';
import * as React from 'react';
import {
  Module,
  Controller,
  Get,
  Post,
  Injectable,
  createApp,
  JsxRender,
  Param,
  Body,
  Query,
  UseGuards,
  CanActivate,
  ExecutionContext,
  HttpException,
  PageProps,
  JsxLayout,
} from '../../core/src/runtime';

// ============ Layout Component ============

const SimpleLayout: JsxLayout = ({ children, meta }) => {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{meta?.title || 'HarpyJS App'}</title>
        {meta?.description && <meta name="description" content={meta.description} />}
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }
          .container { max-width: 800px; margin: 0 auto; padding: 2rem; }
          h1 { color: #7c3aed; margin-bottom: 1rem; }
          p { margin-bottom: 1rem; color: #374151; }
          a { color: #7c3aed; text-decoration: none; }
          a:hover { text-decoration: underline; }
          .card { background: #f9fafb; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; }
          code { background: #e5e7eb; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
        `}} />
      </head>
      <body>
        <div className="container">
          {children}
        </div>
      </body>
    </html>
  );
};

// ============ Page Components ============

interface HomeProps extends PageProps {
  message: string;
  timestamp: string;
}

const HomePage: React.FC<HomeProps> = ({ message, timestamp }) => {
  return (
    <>
      <h1>🦅 Welcome to HarpyJS</h1>
      <p>{message}</p>
      <div className="card">
        <p><strong>Server Time:</strong> {timestamp}</p>
        <p><strong>Runtime:</strong> Bun 🍞</p>
      </div>
      <h2>Try these routes:</h2>
      <ul>
        <li><a href="/api/hello">GET /api/hello</a> - JSON response</li>
        <li><a href="/users/123">GET /users/123</a> - Route parameters</li>
        <li><a href="/search?q=harpy">GET /search?q=harpy</a> - Query parameters</li>
        <li><a href="/protected">GET /protected</a> - Guarded route (will fail)</li>
      </ul>
    </>
  );
};

interface UserProps extends PageProps {
  user: {
    id: string;
    name: string;
  };
}

const UserPage: React.FC<UserProps> = ({ user }) => {
  return (
    <>
      <h1>User Profile</h1>
      <div className="card">
        <p><strong>ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.name}</p>
      </div>
      <a href="/">← Back to Home</a>
    </>
  );
};

// ============ Services ============

@Injectable()
class GreetingService {
  getGreeting(): string {
    return 'Hello from HarpyJS running on Bun! ⚡';
  }

  getTimestamp(): string {
    return new Date().toISOString();
  }
}

@Injectable()
class UserService {
  getUser(id: string) {
    return {
      id,
      name: `User ${id}`,
    };
  }
}

// ============ Guards ============

@Injectable()
class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.request;
    const authHeader = request.headers.get('authorization');
    
    // Simple check - in real app, validate JWT token
    if (authHeader === 'Bearer secret-token') {
      return true;
    }
    
    throw new HttpException(401, 'Unauthorized: Missing or invalid token');
  }
}

// ============ Controllers ============

@Controller()
class HomeController {
  constructor(private readonly greetingService: GreetingService) {}

  @Get()
  @JsxRender(HomePage, {
    meta: {
      title: 'HarpyJS - Bun Runtime Example',
      description: 'A simple example of HarpyJS running on Bun',
    },
  })
  home(): HomeProps {
    return {
      message: this.greetingService.getGreeting(),
      timestamp: this.greetingService.getTimestamp(),
    };
  }
}

@Controller('api')
class ApiController {
  constructor(private readonly greetingService: GreetingService) {}

  @Get('hello')
  hello() {
    return {
      message: this.greetingService.getGreeting(),
      timestamp: this.greetingService.getTimestamp(),
    };
  }

  @Post('echo')
  echo(@Body() body: any) {
    return {
      received: body,
      timestamp: this.greetingService.getTimestamp(),
    };
  }
}

@Controller('users')
class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @JsxRender(UserPage, {
    meta: (req, data: UserProps) => ({
      title: `User ${data.user.id} - HarpyJS`,
    }),
  })
  getUser(@Param('id') id: string): UserProps {
    return {
      user: this.userService.getUser(id),
    };
  }
}

@Controller('search')
class SearchController {
  @Get()
  search(@Query('q') query: string, @Query('page') page: string) {
    return {
      query: query || '',
      page: parseInt(page || '1', 10),
      results: query ? [`Result 1 for "${query}"`, `Result 2 for "${query}"`] : [],
    };
  }
}

@Controller('protected')
class ProtectedController {
  @Get()
  @UseGuards(AuthGuard)
  secretData() {
    return {
      secret: 'This is protected data!',
      accessedAt: new Date().toISOString(),
    };
  }
}

// ============ Module ============

@Module({
  controllers: [
    HomeController,
    ApiController,
    UserController,
    SearchController,
    ProtectedController,
  ],
  providers: [
    GreetingService,
    UserService,
    AuthGuard,
  ],
})
class AppModule {}

// ============ Bootstrap ============

async function bootstrap() {
  console.log('🦅 Starting HarpyJS Example...\n');

  const app = await createApp(AppModule, {
    publicDir: 'public',
  });

  // Configure JSX engine
  app.getRouter().setJsxConfig({
    defaultLayout: SimpleLayout,
    isDev: process.env.NODE_ENV !== 'production',
  });

  // Enable CORS
  app.enableCors();

  // Logging middleware
  app.use(async (request, next) => {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;
    const url = new URL(request.url);
    console.log(`${request.method} ${url.pathname} - ${response.status} (${duration}ms)`);
    return response;
  });

  await app.listen(3000);
}

void bootstrap();
