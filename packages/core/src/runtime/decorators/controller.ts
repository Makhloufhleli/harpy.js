import 'reflect-metadata';
import { DI_METADATA, getContainer } from '../di';

/**
 * Metadata keys for controller system
 */
export const CONTROLLER_METADATA = {
  CONTROLLER: Symbol('harpy:controller'),
  PATH: 'harpy:controller:path',
  ROUTES: 'harpy:routes',
  HOST: 'harpy:host',
  SCOPE: 'harpy:controller:scope',
} as const;

/**
 * Controller options
 */
export interface ControllerOptions {
  /** Base path for all routes in this controller */
  path?: string;
  /** Host name constraint for this controller */
  host?: string;
}

/**
 * Registry to store controller metadata
 */
export class ControllerRegistry {
  private static instance: ControllerRegistry | null = null;
  private controllers = new Map<Function, ControllerMetadata>();

  static getInstance(): ControllerRegistry {
    if (!ControllerRegistry.instance) {
      ControllerRegistry.instance = new ControllerRegistry();
    }
    return ControllerRegistry.instance;
  }

  static resetInstance(): void {
    ControllerRegistry.instance = null;
  }

  register(target: Function, metadata: ControllerMetadata): void {
    this.controllers.set(target, metadata);
  }

  get(target: Function): ControllerMetadata | undefined {
    return this.controllers.get(target);
  }

  getAll(): Map<Function, ControllerMetadata> {
    return this.controllers;
  }

  clear(): void {
    this.controllers.clear();
  }
}

/**
 * Controller metadata structure
 */
export interface ControllerMetadata {
  target: Function;
  path: string;
  host?: string;
  routes: RouteMetadata[];
}

/**
 * Route metadata structure
 */
export interface RouteMetadata {
  method: HttpMethod;
  path: string;
  methodName: string;
  handler: Function;
}

/**
 * HTTP methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'ALL';

/**
 * @Controller() decorator
 * 
 * Marks a class as a controller that handles incoming HTTP requests.
 * Controllers define route handlers using method decorators.
 * 
 * @param prefixOrOptions - Route prefix string or options object
 * 
 * @example
 * ```typescript
 * @Controller('users')
 * export class UserController {
 *   @Get()
 *   getUsers() {
 *     return { users: [] };
 *   }
 * 
 *   @Get(':id')
 *   getUser(@Param('id') id: string) {
 *     return { id };
 *   }
 * }
 * ```
 */
export function Controller(prefixOrOptions?: string | ControllerOptions): ClassDecorator {
  return function (target: Function) {
    let path = '';
    let host: string | undefined;

    if (typeof prefixOrOptions === 'string') {
      path = prefixOrOptions;
    } else if (prefixOrOptions) {
      path = prefixOrOptions.path || '';
      host = prefixOrOptions.host;
    }

    // Normalize path (ensure it starts with /)
    if (path && !path.startsWith('/')) {
      path = '/' + path;
    }

    // Mark as controller
    Reflect.defineMetadata(CONTROLLER_METADATA.CONTROLLER, true, target);
    Reflect.defineMetadata(CONTROLLER_METADATA.PATH, path, target);
    
    if (host) {
      Reflect.defineMetadata(CONTROLLER_METADATA.HOST, host, target);
    }

    // Mark as injectable so it can be resolved by DI
    Reflect.defineMetadata(DI_METADATA.INJECTABLE, true, target);

    // Register with DI container
    getContainer().register(target as any);

    // Get routes registered on this controller
    const routes: RouteMetadata[] = 
      Reflect.getMetadata(CONTROLLER_METADATA.ROUTES, target.prototype) || [];

    // Register with controller registry
    const registry = ControllerRegistry.getInstance();
    registry.register(target, {
      target,
      path,
      host,
      routes,
    });
  };
}

/**
 * Check if a class is a controller
 */
export function isController(target: any): boolean {
  return Reflect.getMetadata(CONTROLLER_METADATA.CONTROLLER, target) === true;
}

/**
 * Get controller path
 */
export function getControllerPath(target: Function): string {
  return Reflect.getMetadata(CONTROLLER_METADATA.PATH, target) || '';
}

/**
 * Get controller routes
 */
export function getControllerRoutes(target: Function): RouteMetadata[] {
  return Reflect.getMetadata(CONTROLLER_METADATA.ROUTES, target.prototype) || [];
}

/**
 * Get controller registry
 */
export function getControllerRegistry(): ControllerRegistry {
  return ControllerRegistry.getInstance();
}

/**
 * Internal helper to add a route to a controller
 */
export function addRoute(
  target: Object,
  method: HttpMethod,
  path: string,
  methodName: string,
  handler: Function
): void {
  const routes: RouteMetadata[] =
    Reflect.getMetadata(CONTROLLER_METADATA.ROUTES, target) || [];
  
  routes.push({
    method,
    path,
    methodName,
    handler,
  });

  Reflect.defineMetadata(CONTROLLER_METADATA.ROUTES, routes, target);
}
