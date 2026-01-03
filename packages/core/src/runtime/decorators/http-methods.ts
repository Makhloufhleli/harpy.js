import 'reflect-metadata';
import { addRoute, HttpMethod } from './controller';

/**
 * Metadata keys for HTTP method decorators
 */
export const HTTP_METADATA = {
  METHOD: 'harpy:http:method',
  PATH: 'harpy:http:path',
  STATUS_CODE: 'harpy:http:statusCode',
  HEADERS: 'harpy:http:headers',
  REDIRECT: 'harpy:http:redirect',
  RENDER: 'harpy:http:render',
} as const;

/**
 * Helper function to create HTTP method decorators
 */
function createMethodDecorator(method: HttpMethod) {
  return function (path: string = ''): MethodDecorator {
    return function (
      target: Object,
      propertyKey: string | symbol,
      descriptor: TypedPropertyDescriptor<any>
    ) {
      // Normalize path
      let normalizedPath = path;
      if (normalizedPath && !normalizedPath.startsWith('/')) {
        normalizedPath = '/' + normalizedPath;
      }

      // Store HTTP method metadata
      Reflect.defineMetadata(HTTP_METADATA.METHOD, method, descriptor.value);
      Reflect.defineMetadata(HTTP_METADATA.PATH, normalizedPath, descriptor.value);

      // Register the route
      addRoute(target, method, normalizedPath, String(propertyKey), descriptor.value);

      return descriptor;
    };
  };
}

/**
 * @Get() decorator
 * 
 * Marks a method as a GET request handler.
 * 
 * @param path - Route path (can include parameters like :id)
 * 
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Get()
 *   findAll() { return []; }
 * 
 *   @Get(':id')
 *   findOne(@Param('id') id: string) { return { id }; }
 * }
 * ```
 */
export const Get = createMethodDecorator('GET');

/**
 * @Post() decorator
 * 
 * Marks a method as a POST request handler.
 * 
 * @param path - Route path
 * 
 * @example
 * ```typescript
 * @Controller('users')
 * class UserController {
 *   @Post()
 *   create(@Body() body: CreateUserDto) { return body; }
 * }
 * ```
 */
export const Post = createMethodDecorator('POST');

/**
 * @Put() decorator
 * 
 * Marks a method as a PUT request handler.
 * 
 * @param path - Route path
 */
export const Put = createMethodDecorator('PUT');

/**
 * @Delete() decorator
 * 
 * Marks a method as a DELETE request handler.
 * 
 * @param path - Route path
 */
export const Delete = createMethodDecorator('DELETE');

/**
 * @Patch() decorator
 * 
 * Marks a method as a PATCH request handler.
 * 
 * @param path - Route path
 */
export const Patch = createMethodDecorator('PATCH');

/**
 * @Options() decorator
 * 
 * Marks a method as an OPTIONS request handler.
 * 
 * @param path - Route path
 */
export const Options = createMethodDecorator('OPTIONS');

/**
 * @Head() decorator
 * 
 * Marks a method as a HEAD request handler.
 * 
 * @param path - Route path
 */
export const Head = createMethodDecorator('HEAD');

/**
 * @All() decorator
 * 
 * Marks a method as a handler for all HTTP methods.
 * 
 * @param path - Route path
 */
export const All = createMethodDecorator('ALL');

/**
 * @HttpCode() decorator
 * 
 * Sets the HTTP status code for the response.
 * 
 * @param statusCode - HTTP status code
 * 
 * @example
 * ```typescript
 * @Post()
 * @HttpCode(201)
 * create() { return { created: true }; }
 * ```
 */
export function HttpCode(statusCode: number): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    Reflect.defineMetadata(HTTP_METADATA.STATUS_CODE, statusCode, descriptor.value);
    return descriptor;
  };
}

/**
 * @Header() decorator
 * 
 * Sets a response header.
 * 
 * @param name - Header name
 * @param value - Header value
 * 
 * @example
 * ```typescript
 * @Get()
 * @Header('Cache-Control', 'none')
 * getData() { return {}; }
 * ```
 */
export function Header(name: string, value: string): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    const existingHeaders: Map<string, string> =
      Reflect.getMetadata(HTTP_METADATA.HEADERS, descriptor.value) || new Map();
    
    existingHeaders.set(name, value);
    
    Reflect.defineMetadata(HTTP_METADATA.HEADERS, existingHeaders, descriptor.value);
    return descriptor;
  };
}

/**
 * @Redirect() decorator
 * 
 * Redirects to a URL.
 * 
 * @param url - Redirect URL
 * @param statusCode - HTTP status code (default: 302)
 * 
 * @example
 * ```typescript
 * @Get('old-path')
 * @Redirect('/new-path', 301)
 * oldPath() {}
 * ```
 */
export function Redirect(url: string, statusCode: number = 302): MethodDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<any>
  ) {
    Reflect.defineMetadata(HTTP_METADATA.REDIRECT, { url, statusCode }, descriptor.value);
    return descriptor;
  };
}
