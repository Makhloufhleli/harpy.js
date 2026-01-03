import 'reflect-metadata';
import { Type, getContainer, Container, Provider } from '../di';
import {
  getModuleMetadata,
  isModule,
  getModuleRegistry,
  ModuleRegistry,
} from '../decorators/module';
import { isController, getControllerRegistry, ControllerRegistry } from '../decorators/controller';
import { Router, createRouter } from '../router';
import { initializeChunkCache } from '../jsx/engine';

// Bun server type with any WebSocket data
type BunServer = ReturnType<typeof Bun.serve>;

/**
 * Application options
 */
export interface HarpyAppOptions {
  /** Base path prefix for all routes */
  globalPrefix?: string;
  /** Enable CORS */
  cors?: boolean | CorsOptions;
  /** Static files directory */
  staticDir?: string;
  /** Public files directory (served at root) */
  publicDir?: string;
}

/**
 * CORS configuration options
 */
export interface CorsOptions {
  origin?: string | string[] | boolean;
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Server listen options
 */
export interface ListenOptions {
  port?: number;
  hostname?: string;
}

/**
 * Middleware function type
 */
export type MiddlewareFunction = (
  request: Request,
  next: () => Promise<Response>
) => Promise<Response> | Response;

/**
 * Harpy Application Factory
 * 
 * The main application class that bootstraps and runs a Harpy application
 * using Bun's native HTTP server.
 */
export class HarpyFactory {
  private router: Router;
  private container: Container;
  private moduleRegistry: ModuleRegistry;
  private controllerRegistry: ControllerRegistry;
  private middlewares: MiddlewareFunction[] = [];
  private options: HarpyAppOptions;
  private server: BunServer | null = null;
  private rootModule: Type | null = null;
  private staticMappings: Map<string, string> = new Map();

  private constructor(options: HarpyAppOptions = {}) {
    this.options = options;
    this.router = createRouter();
    this.container = getContainer();
    this.moduleRegistry = getModuleRegistry();
    this.controllerRegistry = getControllerRegistry();
  }

  /**
   * Create a new Harpy application from a root module
   * 
   * @param rootModule - The root module class
   * @param options - Application options
   * 
   * @example
   * ```typescript
   * const app = await HarpyFactory.create(AppModule);
   * await app.listen({ port: 3000 });
   * ```
   */
  static async create(rootModule: Type, options: HarpyAppOptions = {}): Promise<HarpyFactory> {
    // Initialize chunk cache for hydration
    initializeChunkCache();
    
    const app = new HarpyFactory(options);
    app.rootModule = rootModule;

    // Initialize the module tree
    await app.initializeModule(rootModule);

    // Register all controllers with the router
    app.router.registerAllControllers();

    // Run onModuleInit lifecycle hooks
    await app.runLifecycleHooks('onModuleInit');

    return app;
  }

  /**
   * Initialize a module and its dependencies
   */
  private async initializeModule(moduleClass: Type, visited = new Set<Type>()): Promise<void> {
    // Prevent circular module initialization
    if (visited.has(moduleClass)) {
      return;
    }
    visited.add(moduleClass);

    if (!isModule(moduleClass)) {
      throw new Error(`${moduleClass.name} is not a valid module. Did you forget @Module()?`);
    }

    const metadata = getModuleMetadata(moduleClass);

    // Initialize imported modules first
    for (const importedModule of metadata.imports || []) {
      await this.initializeModule(importedModule, visited);
    }

    // Register providers
    for (const provider of metadata.providers || []) {
      this.container.register(provider);
    }

    // Register controllers (they're already registered by @Controller decorator)
    // Just log them for visibility
    for (const controller of metadata.controllers || []) {
      if (!isController(controller)) {
        console.warn(`${controller.name} in ${moduleClass.name} is not a valid controller`);
      }
    }

    console.log(`[HarpyApp] Initialized module: ${moduleClass.name}`);
  }

  /**
   * Run lifecycle hooks on all modules
   */
  private async runLifecycleHooks(hookName: string): Promise<void> {
    const allModules = this.moduleRegistry.getAll();

    for (const moduleDef of allModules) {
      try {
        // Try to resolve the module instance
        const moduleInstance = this.container.resolve(moduleDef.target);
        
        if (moduleInstance && typeof moduleInstance[hookName] === 'function') {
          await moduleInstance[hookName]();
        }
      } catch {
        // Module might not be injectable, skip
      }
    }
  }

  /**
   * Add a global middleware
   * 
   * @example
   * ```typescript
   * app.use(async (request, next) => {
   *   console.log(`${request.method} ${request.url}`);
   *   return next();
   * });
   * ```
   */
  use(middleware: MiddlewareFunction): this {
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Set a global route prefix
   */
  setGlobalPrefix(prefix: string): this {
    this.options.globalPrefix = prefix;
    return this;
  }

  /**
   * Enable CORS
   */
  enableCors(options?: CorsOptions): this {
    this.options.cors = options || true;
    return this;
  }

  /**
   * Serve static files from a directory
   * 
   * @param urlPath - URL path prefix to serve from (e.g., '/public', '/static')
   * @param directory - Directory path relative to project root
   * 
   * @example
   * ```typescript
   * app.useStatic('/public', './public');
   * app.useStatic('/assets', './dist/assets');
   * ```
   */
  useStatic(urlPath: string, directory: string): this {
    // Store the mapping for static file serving
    if (!this.staticMappings) {
      this.staticMappings = new Map();
    }
    this.staticMappings.set(urlPath, directory);
    
    // Also set publicDir for backward compatibility
    if (urlPath === '/public' || urlPath === '/') {
      this.options.publicDir = directory;
    } else {
      this.options.staticDir = directory;
    }
    
    return this;
  }

  /**
   * Get the underlying DI container
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get the router
   */
  getRouter(): Router {
    return this.router;
  }

  /**
   * Resolve a provider from the DI container
   */
  get<T>(token: Type<T> | string | symbol): T {
    return this.container.resolve(token);
  }

  /**
   * Handle an incoming request
   */
  private async handleRequest(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (this.options.cors && request.method === 'OPTIONS') {
      return this.handleCors(request, new Response(null, { status: 204 }));
    }

    // Serve Harpy built assets from /_harpy/ path (CSS, JS chunks)
    if (url.pathname.startsWith('/_harpy/')) {
      const harpyBaseDir = process.env.HARPY_DIR || '.harpy';
      const relativePath = url.pathname.slice('/_harpy/'.length);
      
      // Try serving from .harpy/static first (for CSS)
      let staticResponse = await this.serveStaticFile('/' + relativePath, `${harpyBaseDir}/static`);
      
      // If not found in static, try .harpy/chunks (for hydration JS)
      if (!staticResponse && relativePath.startsWith('chunks/')) {
        const chunkPath = relativePath.slice('chunks/'.length);
        staticResponse = await this.serveStaticFile('/' + chunkPath, `${harpyBaseDir}/chunks`);
      }
      
      if (staticResponse) {
        // Add long cache headers for built assets
        const headers = new Headers(staticResponse.headers);
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        return this.handleCors(request, new Response(staticResponse.body, {
          status: staticResponse.status,
          headers,
        }));
      }
    }

    // Check static file mappings (e.g., /public -> ./public)
    for (const [urlPrefix, directory] of this.staticMappings.entries()) {
      if (url.pathname.startsWith(urlPrefix)) {
        // Strip the URL prefix to get the relative path
        const relativePath = url.pathname.slice(urlPrefix.length) || '/';
        const staticResponse = await this.serveStaticFile(relativePath, directory);
        if (staticResponse) {
          return this.handleCors(request, staticResponse);
        }
      }
    }

    // Fallback to publicDir/staticDir for backward compatibility
    if (this.options.publicDir && !this.staticMappings.size) {
      const staticResponse = await this.serveStaticFile(url.pathname, this.options.publicDir);
      if (staticResponse) {
        return this.handleCors(request, staticResponse);
      }
    }

    if (this.options.staticDir && !this.staticMappings.size) {
      const staticResponse = await this.serveStaticFile(url.pathname, this.options.staticDir);
      if (staticResponse) {
        return this.handleCors(request, staticResponse);
      }
    }

    // Run middleware chain
    let index = 0;
    const middlewares = this.middlewares;

    const next = async (): Promise<Response> => {
      if (index < middlewares.length) {
        const middleware = middlewares[index++];
        return middleware(request, next);
      }
      // End of middleware chain, route the request
      return this.router.handle(request);
    };

    try {
      const response = await next();
      return this.handleCors(request, response);
    } catch (error) {
      console.error('[HarpyApp] Unhandled error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Add CORS headers to a response
   */
  private handleCors(request: Request, response: Response): Response {
    if (!this.options.cors) {
      return response;
    }

    const corsOptions: CorsOptions =
      typeof this.options.cors === 'object' ? this.options.cors : {};

    const headers = new Headers(response.headers);
    const origin = request.headers.get('origin');

    // Set Origin header
    if (corsOptions.origin === true || corsOptions.origin === undefined) {
      headers.set('Access-Control-Allow-Origin', origin || '*');
    } else if (typeof corsOptions.origin === 'string') {
      headers.set('Access-Control-Allow-Origin', corsOptions.origin);
    } else if (Array.isArray(corsOptions.origin) && origin) {
      if (corsOptions.origin.includes(origin)) {
        headers.set('Access-Control-Allow-Origin', origin);
      }
    }

    // Set other CORS headers
    headers.set(
      'Access-Control-Allow-Methods',
      (corsOptions.methods || ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']).join(', ')
    );

    if (corsOptions.allowedHeaders) {
      headers.set('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    } else {
      const requestHeaders = request.headers.get('access-control-request-headers');
      if (requestHeaders) {
        headers.set('Access-Control-Allow-Headers', requestHeaders);
      }
    }

    if (corsOptions.exposedHeaders) {
      headers.set('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
    }

    if (corsOptions.credentials) {
      headers.set('Access-Control-Allow-Credentials', 'true');
    }

    if (corsOptions.maxAge !== undefined) {
      headers.set('Access-Control-Max-Age', String(corsOptions.maxAge));
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }

  /**
   * Serve a static file
   */
  private async serveStaticFile(pathname: string, baseDir: string): Promise<Response | null> {
    // Prevent directory traversal
    if (pathname.includes('..')) {
      return null;
    }

    const filePath = `${baseDir}${pathname}`;

    try {
      const file = Bun.file(filePath);
      const exists = await file.exists();
      
      if (!exists) {
        // Try index.html for directories
        if (!pathname.includes('.')) {
          const indexPath = `${filePath}/index.html`;
          const indexFile = Bun.file(indexPath);
          if (await indexFile.exists()) {
            return new Response(indexFile);
          }
        }
        return null;
      }

      return new Response(file);
    } catch {
      return null;
    }
  }

  /**
   * Start the HTTP server
   * 
   * @example
   * ```typescript
   * await app.listen({ port: 3000 });
   * // or
   * await app.listen(3000);
   * ```
   */
  async listen(optionsOrPort?: ListenOptions | number): Promise<void> {
    const options: ListenOptions =
      typeof optionsOrPort === 'number'
        ? { port: optionsOrPort }
        : optionsOrPort || {};

    const port = options.port || parseInt(process.env.PORT || '3000', 10);
    const hostname = options.hostname || '0.0.0.0';

    this.server = Bun.serve({
      port,
      hostname,
      fetch: (request) => this.handleRequest(request),
    });

    // Run onApplicationBootstrap hooks
    await this.runLifecycleHooks('onApplicationBootstrap');

    console.log(`\n🚀 Harpy application is running on: http://${hostname}:${port}\n`);
  }

  /**
   * Get the server URL
   */
  getUrl(): string {
    if (!this.server) {
      throw new Error('Server is not running');
    }
    return `http://${this.server.hostname}:${this.server.port}`;
  }

  /**
   * Stop the server
   */
  async close(): Promise<void> {
    // Run onApplicationShutdown hooks
    await this.runLifecycleHooks('onApplicationShutdown');

    if (this.server) {
      this.server.stop();
      this.server = null;
    }
  }
}

/**
 * Type alias for backward compatibility
 */
export type HarpyApp = HarpyFactory;
export const HarpyApp = HarpyFactory;

/**
 * Create a new Harpy application
 * 
 * @param rootModule - The root module class
 * @param options - Application options
 * 
 * @example
 * ```typescript
 * const app = await createApp(AppModule);
 * await app.listen(3000);
 * ```
 */
export async function createApp(
  rootModule: Type,
  options?: HarpyAppOptions
): Promise<HarpyFactory> {
  return HarpyFactory.create(rootModule, options);
}
