import 'reflect-metadata';
import { Type, getContainer } from '../di';
import { RequestContext } from '../decorators/params';

/**
 * Metadata keys for guards and interceptors
 */
export const MIDDLEWARE_METADATA = {
  GUARDS: 'harpy:guards',
  INTERCEPTORS: 'harpy:interceptors',
  USE_GUARDS: 'harpy:useGuards',
  USE_INTERCEPTORS: 'harpy:useInterceptors',
} as const;

/**
 * Execution context available to guards and interceptors
 */
export interface ExecutionContext {
  /** The raw Bun request */
  request: Request;
  /** Route parameters */
  params: Record<string, string>;
  /** Query parameters */
  query: URLSearchParams;
  /** Request body */
  body?: any;
  /** Request headers */
  headers: Headers;
  /** Cookies */
  cookies: Record<string, string>;
  /** Controller class */
  controllerClass: Type;
  /** Handler method name */
  handler: string;
  /** Get a value from the DI container */
  get<T>(token: Type<T> | string | symbol): T;
}

/**
 * Guard interface
 * 
 * Guards determine whether a request should be handled by the route handler.
 * Return true to allow, false to deny.
 */
export interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}

/**
 * Interceptor call handler
 */
export interface CallHandler<T = any> {
  handle(): Promise<T>;
}

/**
 * Interceptor interface
 * 
 * Interceptors can transform the request/response or add extra logic
 * before/after the route handler executes.
 */
export interface HarpyInterceptor<T = any, R = any> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Promise<R>;
}

/**
 * @UseGuards() decorator
 * 
 * Apply guards to a controller or method.
 * 
 * @param guards - Guard classes to apply
 * 
 * @example
 * ```typescript
 * @Controller('admin')
 * @UseGuards(AuthGuard)
 * class AdminController {
 *   @Get()
 *   @UseGuards(RoleGuard)
 *   getSecretData() { return { secret: true }; }
 * }
 * ```
 */
export function UseGuards(...guards: Type<CanActivate>[]): ClassDecorator & MethodDecorator {
  return function (
    target: Object | Function,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) {
    if (descriptor) {
      // Method decorator
      const existingGuards: Type<CanActivate>[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA.GUARDS, descriptor.value) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA.GUARDS,
        [...guards, ...existingGuards],
        descriptor.value
      );
      return descriptor;
    } else {
      // Class decorator
      const existingGuards: Type<CanActivate>[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA.GUARDS, target) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA.GUARDS,
        [...guards, ...existingGuards],
        target
      );
    }
  } as ClassDecorator & MethodDecorator;
}

/**
 * @UseInterceptors() decorator
 * 
 * Apply interceptors to a controller or method.
 * 
 * @param interceptors - Interceptor classes to apply
 * 
 * @example
 * ```typescript
 * @Controller('api')
 * @UseInterceptors(LoggingInterceptor)
 * class ApiController {
 *   @Get()
 *   @UseInterceptors(CacheInterceptor)
 *   getData() { return { data: true }; }
 * }
 * ```
 */
export function UseInterceptors(
  ...interceptors: Type<HarpyInterceptor>[]
): ClassDecorator & MethodDecorator {
  return function (
    target: Object | Function,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) {
    if (descriptor) {
      // Method decorator
      const existing: Type<HarpyInterceptor>[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA.INTERCEPTORS, descriptor.value) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA.INTERCEPTORS,
        [...interceptors, ...existing],
        descriptor.value
      );
      return descriptor;
    } else {
      // Class decorator
      const existing: Type<HarpyInterceptor>[] =
        Reflect.getMetadata(MIDDLEWARE_METADATA.INTERCEPTORS, target) || [];
      Reflect.defineMetadata(
        MIDDLEWARE_METADATA.INTERCEPTORS,
        [...interceptors, ...existing],
        target
      );
    }
  } as ClassDecorator & MethodDecorator;
}

/**
 * Get guards for a controller and method
 */
export function getGuards(
  controllerClass: Type,
  methodName: string
): Type<CanActivate>[] {
  const controllerGuards: Type<CanActivate>[] =
    Reflect.getMetadata(MIDDLEWARE_METADATA.GUARDS, controllerClass) || [];
  
  const methodGuards: Type<CanActivate>[] =
    Reflect.getMetadata(
      MIDDLEWARE_METADATA.GUARDS,
      controllerClass.prototype[methodName]
    ) || [];

  return [...controllerGuards, ...methodGuards];
}

/**
 * Get interceptors for a controller and method
 */
export function getInterceptors(
  controllerClass: Type,
  methodName: string
): Type<HarpyInterceptor>[] {
  const controllerInterceptors: Type<HarpyInterceptor>[] =
    Reflect.getMetadata(MIDDLEWARE_METADATA.INTERCEPTORS, controllerClass) || [];
  
  const methodInterceptors: Type<HarpyInterceptor>[] =
    Reflect.getMetadata(
      MIDDLEWARE_METADATA.INTERCEPTORS,
      controllerClass.prototype[methodName]
    ) || [];

  return [...controllerInterceptors, ...methodInterceptors];
}

/**
 * Run guards and return whether the request should proceed
 */
export async function runGuards(
  guards: Type<CanActivate>[],
  context: ExecutionContext
): Promise<boolean> {
  const container = getContainer();

  for (const guardClass of guards) {
    const guard = container.resolve(guardClass);
    const result = await guard.canActivate(context);
    
    if (!result) {
      return false;
    }
  }

  return true;
}

/**
 * Run interceptors and return the final result
 */
export async function runInterceptors<T>(
  interceptors: Type<HarpyInterceptor>[],
  context: ExecutionContext,
  handler: () => Promise<T>
): Promise<T> {
  if (interceptors.length === 0) {
    return handler();
  }

  const container = getContainer();

  // Build the interceptor chain from inside out
  let currentHandler: CallHandler<T> = {
    handle: handler,
  };

  // Apply interceptors in reverse order so the first interceptor wraps the last
  for (let i = interceptors.length - 1; i >= 0; i--) {
    const interceptorClass = interceptors[i];
    const interceptor = container.resolve(interceptorClass);
    const prevHandler = currentHandler;

    currentHandler = {
      handle: () => interceptor.intercept(context, prevHandler),
    };
  }

  return currentHandler.handle();
}

/**
 * Create an execution context from request context
 */
export function createExecutionContext(
  requestContext: RequestContext,
  controllerClass: Type,
  handlerName: string
): ExecutionContext {
  return {
    request: requestContext.request,
    params: requestContext.params,
    query: requestContext.query,
    body: requestContext.body,
    headers: requestContext.headers,
    cookies: requestContext.cookies,
    controllerClass,
    handler: handlerName,
    get: <T>(token: Type<T> | string | symbol) => getContainer().resolve(token),
  };
}
