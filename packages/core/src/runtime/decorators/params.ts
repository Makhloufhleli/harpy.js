import 'reflect-metadata';

/**
 * Metadata keys for parameter decorators
 */
export const PARAM_METADATA = {
  PARAMS: 'harpy:params',
} as const;

/**
 * Parameter types
 */
export enum ParamType {
  PARAM = 'param',
  QUERY = 'query',
  BODY = 'body',
  HEADERS = 'headers',
  REQUEST = 'request',
  RESPONSE = 'response',
  COOKIES = 'cookies',
  IP = 'ip',
  HOST = 'host',
  SESSION = 'session',
  CUSTOM = 'custom',
}

/**
 * Parameter metadata structure
 */
export interface ParamMetadata {
  index: number;
  type: ParamType;
  data?: string; // e.g., param name, header name
  pipes?: any[]; // validation/transformation pipes
  factory?: (ctx: RequestContext) => any; // for custom params
}

/**
 * Request context passed to parameter extractors
 */
export interface RequestContext {
  request: Request;
  params: Record<string, string>;
  query: URLSearchParams;
  body?: any;
  cookies: Record<string, string>;
  headers: Headers;
}

/**
 * Helper to create parameter decorators
 */
function createParamDecorator(type: ParamType, data?: string): ParameterDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    if (propertyKey === undefined) return;

    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAM_METADATA.PARAMS, target, propertyKey) || [];

    existingParams.push({
      index: parameterIndex,
      type,
      data,
    });

    Reflect.defineMetadata(PARAM_METADATA.PARAMS, existingParams, target, propertyKey);
  };
}

/**
 * @Param() decorator
 * 
 * Extracts a route parameter from the request URL.
 * 
 * @param param - Parameter name (optional, if not provided returns all params)
 * 
 * @example
 * ```typescript
 * @Get(':id')
 * getUser(@Param('id') id: string) { return { id }; }
 * 
 * @Get(':category/:id')
 * getItem(@Param() params: { category: string; id: string }) { return params; }
 * ```
 */
export function Param(param?: string): ParameterDecorator {
  return createParamDecorator(ParamType.PARAM, param);
}

/**
 * @Query() decorator
 * 
 * Extracts query parameters from the request URL.
 * 
 * @param key - Query key (optional, if not provided returns all query params)
 * 
 * @example
 * ```typescript
 * @Get()
 * search(@Query('q') query: string, @Query('page') page: string) {
 *   return { query, page };
 * }
 * 
 * @Get()
 * filter(@Query() filters: Record<string, string>) { return filters; }
 * ```
 */
export function Query(key?: string): ParameterDecorator {
  return createParamDecorator(ParamType.QUERY, key);
}

/**
 * @Body() decorator
 * 
 * Extracts the request body.
 * 
 * @param key - Body property key (optional, if not provided returns entire body)
 * 
 * @example
 * ```typescript
 * @Post()
 * create(@Body() data: CreateUserDto) { return data; }
 * 
 * @Post()
 * update(@Body('name') name: string) { return { name }; }
 * ```
 */
export function Body(key?: string): ParameterDecorator {
  return createParamDecorator(ParamType.BODY, key);
}

/**
 * @Headers() decorator
 * 
 * Extracts request headers.
 * 
 * @param header - Header name (optional, if not provided returns all headers)
 * 
 * @example
 * ```typescript
 * @Get()
 * getAuth(@Headers('authorization') auth: string) { return { auth }; }
 * ```
 */
export function Headers(header?: string): ParameterDecorator {
  return createParamDecorator(ParamType.HEADERS, header);
}

/**
 * @Req() decorator
 * 
 * Injects the raw Bun Request object.
 * 
 * @example
 * ```typescript
 * @Get()
 * handle(@Req() request: Request) { return { url: request.url }; }
 * ```
 */
export function Req(): ParameterDecorator {
  return createParamDecorator(ParamType.REQUEST);
}

/**
 * Alias for @Req()
 */
export const Request = Req;

/**
 * @Res() decorator
 * 
 * Marks a parameter to receive the response context.
 * When using @Res(), you must manually send the response.
 * 
 * @example
 * ```typescript
 * @Get()
 * handle(@Res() res: ResponseContext) {
 *   res.status = 200;
 *   res.headers.set('X-Custom', 'value');
 *   return { data: 'value' };
 * }
 * ```
 */
export function Res(): ParameterDecorator {
  return createParamDecorator(ParamType.RESPONSE);
}

/**
 * Alias for @Res()
 */
export const Response = Res;

/**
 * @Cookies() decorator
 * 
 * Extracts cookies from the request.
 * 
 * @param key - Cookie key (optional, if not provided returns all cookies)
 * 
 * @example
 * ```typescript
 * @Get()
 * getSession(@Cookies('sessionId') sessionId: string) { return { sessionId }; }
 * ```
 */
export function Cookies(key?: string): ParameterDecorator {
  return createParamDecorator(ParamType.COOKIES, key);
}

/**
 * @Ip() decorator
 * 
 * Extracts the client IP address.
 * 
 * @example
 * ```typescript
 * @Get()
 * getClientIp(@Ip() ip: string) { return { ip }; }
 * ```
 */
export function Ip(): ParameterDecorator {
  return createParamDecorator(ParamType.IP);
}

/**
 * @HostParam() decorator
 * 
 * Extracts the host from the request.
 * 
 * @example
 * ```typescript
 * @Get()
 * getHost(@HostParam() host: string) { return { host }; }
 * ```
 */
export function HostParam(): ParameterDecorator {
  return createParamDecorator(ParamType.HOST);
}

/**
 * @Session() decorator
 * 
 * Extracts the session from the request.
 * 
 * @example
 * ```typescript
 * @Get()
 * getSession(@Session() session: any) { return session; }
 * ```
 */
export function Session(): ParameterDecorator {
  return createParamDecorator(ParamType.SESSION);
}

/**
 * Create a custom parameter decorator
 * 
 * @param factory - Function that extracts data from the request context
 * 
 * @example
 * ```typescript
 * const CurrentUser = createParamDecorator((ctx) => ctx.request.user);
 * 
 * @Get()
 * getProfile(@CurrentUser() user: User) { return user; }
 * ```
 */
export function createCustomParamDecorator(
  factory: (ctx: RequestContext) => any
): () => ParameterDecorator {
  return function (): ParameterDecorator {
    return function (
      target: Object,
      propertyKey: string | symbol | undefined,
      parameterIndex: number
    ) {
      if (propertyKey === undefined) return;

      const existingParams: ParamMetadata[] =
        Reflect.getMetadata(PARAM_METADATA.PARAMS, target, propertyKey) || [];

      existingParams.push({
        index: parameterIndex,
        type: ParamType.CUSTOM,
        factory,
      });

      Reflect.defineMetadata(PARAM_METADATA.PARAMS, existingParams, target, propertyKey);
    };
  };
}

/**
 * Get parameter metadata for a method
 */
export function getParamMetadata(
  target: Object,
  methodName: string | symbol
): ParamMetadata[] {
  return Reflect.getMetadata(PARAM_METADATA.PARAMS, target, methodName) || [];
}

/**
 * Extract parameter values from request context
 */
export function extractParams(
  params: ParamMetadata[],
  ctx: RequestContext
): any[] {
  // Sort by index to ensure correct order
  const sorted = [...params].sort((a, b) => a.index - b.index);
  const result: any[] = [];

  for (const param of sorted) {
    // Fill gaps with undefined
    while (result.length < param.index) {
      result.push(undefined);
    }

    result[param.index] = extractParamValue(param, ctx);
  }

  return result;
}

/**
 * Extract a single parameter value
 */
function extractParamValue(param: ParamMetadata, ctx: RequestContext): any {
  switch (param.type) {
    case ParamType.PARAM:
      if (param.data) {
        return ctx.params[param.data];
      }
      return ctx.params;

    case ParamType.QUERY:
      if (param.data) {
        return ctx.query.get(param.data);
      }
      return Object.fromEntries(ctx.query.entries());

    case ParamType.BODY:
      if (param.data && ctx.body) {
        return ctx.body[param.data];
      }
      return ctx.body;

    case ParamType.HEADERS:
      if (param.data) {
        return ctx.headers.get(param.data);
      }
      // Convert Headers to plain object
      const headersObj: Record<string, string> = {};
      ctx.headers.forEach((value, key) => {
        headersObj[key] = value;
      });
      return headersObj;

    case ParamType.REQUEST:
      return ctx.request;

    case ParamType.RESPONSE:
      // Response context will be injected by the router
      return undefined;

    case ParamType.COOKIES:
      if (param.data) {
        return ctx.cookies[param.data];
      }
      return ctx.cookies;

    case ParamType.IP:
      // Extract IP from headers or connection
      return ctx.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
             ctx.headers.get('x-real-ip') ||
             'unknown';

    case ParamType.HOST:
      return ctx.headers.get('host');

    case ParamType.SESSION:
      // Session will be added by session middleware
      return (ctx as any).session;

    case ParamType.CUSTOM:
      if (param.factory) {
        return param.factory(ctx);
      }
      return undefined;

    default:
      return undefined;
  }
}
