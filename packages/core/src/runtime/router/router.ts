import { Type, getContainer } from '../di';
import {
  getControllerPath,
  getControllerRoutes,
  HttpMethod,
  RouteMetadata,
  getControllerRegistry,
} from '../decorators/controller';
import {
  getParamMetadata,
  extractParams,
  RequestContext,
} from '../decorators/params';
import { HTTP_METADATA } from '../decorators/http-methods';
import {
  getJsxRenderMetadata,
  renderJsx,
  JsxEngineConfig,
} from '../jsx';

/**
 * Compiled route definition
 */
export interface CompiledRoute {
  method: HttpMethod;
  pattern: RegExp;
  paramNames: string[];
  controllerClass: Type;
  methodName: string;
  handler: Function;
  fullPath: string;
}

/**
 * Route match result
 */
export interface RouteMatch {
  route: CompiledRoute;
  params: Record<string, string>;
}

/**
 * Response context for @Res() decorator
 */
export interface ResponseContext {
  status: number;
  headers: Map<string, string>;
  cookies: Array<{ name: string; value: string; options?: CookieOptions }>;
}

export interface CookieOptions {
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Router class for matching and handling routes
 */
export class Router {
  private routes: CompiledRoute[] = [];
  private jsxConfig: JsxEngineConfig = {};

  /**
   * Set JSX engine configuration
   */
  setJsxConfig(config: JsxEngineConfig): void {
    this.jsxConfig = config;
  }

  /**
   * Register a controller with the router
   */
  registerController(controllerClass: Type): void {
    const basePath = getControllerPath(controllerClass);
    const routes = getControllerRoutes(controllerClass);

    for (const route of routes) {
      const fullPath = this.normalizePath(basePath + route.path);
      const { pattern, paramNames } = this.compilePattern(fullPath);

      this.routes.push({
        method: route.method,
        pattern,
        paramNames,
        controllerClass,
        methodName: route.methodName,
        handler: route.handler,
        fullPath,
      });

      console.log(`[Router] Registered ${route.method} ${fullPath}`);
    }
  }

  /**
   * Register all controllers from the registry
   */
  registerAllControllers(): void {
    const registry = getControllerRegistry();
    for (const [controllerClass] of registry.getAll()) {
      this.registerController(controllerClass as Type);
    }
  }

  /**
   * Find a matching route for a request
   */
  match(method: string, pathname: string): RouteMatch | null {
    const normalizedMethod = method.toUpperCase() as HttpMethod;

    for (const route of this.routes) {
      // Check method match (ALL matches everything)
      if (route.method !== 'ALL' && route.method !== normalizedMethod) {
        continue;
      }

      // Check pattern match
      const match = route.pattern.exec(pathname);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });

        return { route, params };
      }
    }

    return null;
  }

  /**
   * Handle an incoming request
   */
  async handle(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;

    const match = this.match(request.method, pathname);
    if (!match) {
      return new Response('Not Found', { status: 404 });
    }

    const { route, params } = match;

    try {
      // Get controller instance from DI container
      const container = getContainer();
      const controller = container.resolve(route.controllerClass);

      // Build request context
      const ctx = await this.buildRequestContext(request, params);

      // Extract parameter values based on decorators
      const paramMetadata = getParamMetadata(
        route.controllerClass.prototype,
        route.methodName
      );

      // Create response context for @Res() decorator
      const responseCtx: ResponseContext = {
        status: 200,
        headers: new Map(),
        cookies: [],
      };

      // Handle @Res() decorated parameters
      const args = extractParams(paramMetadata, ctx);
      
      // Replace undefined response context with actual context
      for (let i = 0; i < paramMetadata.length; i++) {
        if (paramMetadata[i].type === 'response') {
          args[paramMetadata[i].index] = responseCtx;
        }
      }

      // Call the controller method
      const result = await route.handler.apply(controller, args);

      // Check for JSX render metadata
      const jsxMeta = getJsxRenderMetadata(route.handler);
      if (jsxMeta) {
        // Render JSX component
        return renderJsx(
          jsxMeta.template,
          result,
          jsxMeta.options,
          request,
          this.jsxConfig
        );
      }

      // Get metadata for response customization
      const statusCode =
        Reflect.getMetadata(HTTP_METADATA.STATUS_CODE, route.handler) ||
        responseCtx.status;
      const headers: Map<string, string> =
        Reflect.getMetadata(HTTP_METADATA.HEADERS, route.handler) || new Map();
      const redirect = Reflect.getMetadata(HTTP_METADATA.REDIRECT, route.handler);

      // Merge custom headers with response context headers
      const finalHeaders = new Headers();
      for (const [key, value] of headers) {
        finalHeaders.set(key, value);
      }
      for (const [key, value] of responseCtx.headers) {
        finalHeaders.set(key, value);
      }

      // Handle cookies
      for (const cookie of responseCtx.cookies) {
        const cookieStr = this.serializeCookie(cookie.name, cookie.value, cookie.options);
        finalHeaders.append('Set-Cookie', cookieStr);
      }

      // Handle redirect
      if (redirect) {
        return Response.redirect(redirect.url, redirect.statusCode);
      }

      // Build response
      return this.buildResponse(result, statusCode, finalHeaders);
    } catch (error) {
      console.error('[Router] Error handling request:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }

  /**
   * Build request context from Bun request
   */
  private async buildRequestContext(
    request: Request,
    params: Record<string, string>
  ): Promise<RequestContext> {
    const url = new URL(request.url);

    // Parse body for POST/PUT/PATCH requests
    let body: any = undefined;
    const contentType = request.headers.get('content-type') || '';
    
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      if (contentType.includes('application/json')) {
        try {
          body = await request.json();
        } catch {
          body = undefined;
        }
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        try {
          const text = await request.text();
          body = Object.fromEntries(new URLSearchParams(text));
        } catch {
          body = undefined;
        }
      } else if (contentType.includes('multipart/form-data')) {
        try {
          body = await request.formData();
        } catch {
          body = undefined;
        }
      }
    }

    // Parse cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies: Record<string, string> = {};
    if (cookieHeader) {
      cookieHeader.split(';').forEach((cookie) => {
        const [key, ...values] = cookie.split('=');
        if (key) {
          cookies[key.trim()] = values.join('=').trim();
        }
      });
    }

    return {
      request,
      params,
      query: url.searchParams,
      body,
      cookies,
      headers: request.headers,
    };
  }

  /**
   * Build a Response from handler result
   */
  private buildResponse(
    result: any,
    statusCode: number,
    headers: Headers
  ): Response {
    // If result is already a Response, return it
    if (result instanceof Response) {
      return result;
    }

    // If result is null or undefined, return empty response
    if (result === null || result === undefined) {
      return new Response(null, { status: statusCode, headers });
    }

    // If result is a string (could be HTML), detect and set content type
    if (typeof result === 'string') {
      if (!headers.has('content-type')) {
        // Check if it looks like HTML
        if (result.trim().startsWith('<') || result.includes('<!DOCTYPE')) {
          headers.set('content-type', 'text/html; charset=utf-8');
        } else {
          headers.set('content-type', 'text/plain; charset=utf-8');
        }
      }
      return new Response(result, { status: statusCode, headers });
    }

    // For objects/arrays, return JSON
    if (!headers.has('content-type')) {
      headers.set('content-type', 'application/json; charset=utf-8');
    }
    return new Response(JSON.stringify(result), { status: statusCode, headers });
  }

  /**
   * Normalize a path (ensure single leading slash, remove trailing slash)
   */
  private normalizePath(path: string): string {
    // Replace multiple slashes with single slash
    let normalized = path.replace(/\/+/g, '/');
    
    // Ensure leading slash
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    
    // Remove trailing slash (except for root)
    if (normalized.length > 1 && normalized.endsWith('/')) {
      normalized = normalized.slice(0, -1);
    }

    return normalized;
  }

  /**
   * Compile a route pattern into a regex
   */
  private compilePattern(path: string): { pattern: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];

    // Replace :param with capture groups
    const regexStr = path
      .replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, (match) => {
        paramNames.push(match.slice(1));
        return '([^/]+)';
      })
      // Replace * with wildcard
      .replace(/\*/g, '.*');

    return {
      pattern: new RegExp(`^${regexStr}$`),
      paramNames,
    };
  }

  /**
   * Serialize a cookie to a string
   */
  private serializeCookie(
    name: string,
    value: string,
    options?: CookieOptions
  ): string {
    let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options) {
      if (options.maxAge !== undefined) {
        cookie += `; Max-Age=${options.maxAge}`;
      }
      if (options.expires) {
        cookie += `; Expires=${options.expires.toUTCString()}`;
      }
      if (options.path) {
        cookie += `; Path=${options.path}`;
      }
      if (options.domain) {
        cookie += `; Domain=${options.domain}`;
      }
      if (options.secure) {
        cookie += '; Secure';
      }
      if (options.httpOnly) {
        cookie += '; HttpOnly';
      }
      if (options.sameSite) {
        cookie += `; SameSite=${options.sameSite}`;
      }
    }

    return cookie;
  }

  /**
   * Get all registered routes
   */
  getRoutes(): CompiledRoute[] {
    return this.routes;
  }

  /**
   * Clear all routes
   */
  clear(): void {
    this.routes = [];
  }
}

/**
 * Create a new router instance
 */
export function createRouter(): Router {
  return new Router();
}
