import 'reflect-metadata';
import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { Type, getContainer } from '../di';
import { ExecutionContext } from '../middleware';

/**
 * Metadata key for exception filters
 */
export const EXCEPTION_FILTER_METADATA = 'harpy:exception:filter';
export const CATCH_METADATA = 'harpy:catch';

/**
 * HTTP Exception base class
 */
export class HttpException extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly response?: any
  ) {
    super(message);
    this.name = 'HttpException';
  }
}

/**
 * Common HTTP exceptions
 */
export class BadRequestException extends HttpException {
  constructor(message: string = 'Bad Request', response?: any) {
    super(400, message, response);
    this.name = 'BadRequestException';
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message: string = 'Unauthorized', response?: any) {
    super(401, message, response);
    this.name = 'UnauthorizedException';
  }
}

export class ForbiddenException extends HttpException {
  constructor(message: string = 'Forbidden', response?: any) {
    super(403, message, response);
    this.name = 'ForbiddenException';
  }
}

export class NotFoundException extends HttpException {
  constructor(message: string = 'Not Found', response?: any) {
    super(404, message, response);
    this.name = 'NotFoundException';
  }
}

export class MethodNotAllowedException extends HttpException {
  constructor(message: string = 'Method Not Allowed', response?: any) {
    super(405, message, response);
    this.name = 'MethodNotAllowedException';
  }
}

export class ConflictException extends HttpException {
  constructor(message: string = 'Conflict', response?: any) {
    super(409, message, response);
    this.name = 'ConflictException';
  }
}

export class UnprocessableEntityException extends HttpException {
  constructor(message: string = 'Unprocessable Entity', response?: any) {
    super(422, message, response);
    this.name = 'UnprocessableEntityException';
  }
}

export class InternalServerErrorException extends HttpException {
  constructor(message: string = 'Internal Server Error', response?: any) {
    super(500, message, response);
    this.name = 'InternalServerErrorException';
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string = 'Service Unavailable', response?: any) {
    super(503, message, response);
    this.name = 'ServiceUnavailableException';
  }
}

/**
 * Arguments host for exception filters
 */
export interface ArgumentsHost {
  getRequest(): Request;
  getResponse(): ResponseBuilder;
  getContext(): ExecutionContext | null;
}

/**
 * Response builder for exception handling
 */
export interface ResponseBuilder {
  status(code: number): ResponseBuilder;
  header(name: string, value: string): ResponseBuilder;
  json(data: any): Response;
  html(content: string): Response;
  send(body?: BodyInit | null): Response;
}

/**
 * Create a response builder
 */
export function createResponseBuilder(): ResponseBuilder {
  let statusCode = 200;
  const headers = new Headers();

  const builder: ResponseBuilder = {
    status(code: number) {
      statusCode = code;
      return builder;
    },
    header(name: string, value: string) {
      headers.set(name, value);
      return builder;
    },
    json(data: any) {
      headers.set('Content-Type', 'application/json; charset=utf-8');
      return new Response(JSON.stringify(data), { status: statusCode, headers });
    },
    html(content: string) {
      headers.set('Content-Type', 'text/html; charset=utf-8');
      return new Response(content, { status: statusCode, headers });
    },
    send(body?: BodyInit | null) {
      return new Response(body, { status: statusCode, headers });
    },
  };

  return builder;
}

/**
 * Exception filter interface
 */
export interface ExceptionFilter<T = any> {
  catch(exception: T, host: ArgumentsHost): Response | Promise<Response>;
}

/**
 * @Catch() decorator
 * 
 * Specifies which exception types this filter handles.
 * 
 * @example
 * ```typescript
 * @Catch(HttpException)
 * class HttpExceptionFilter implements ExceptionFilter<HttpException> {
 *   catch(exception: HttpException, host: ArgumentsHost) {
 *     return host.getResponse()
 *       .status(exception.statusCode)
 *       .json({ message: exception.message });
 *   }
 * }
 * ```
 */
export function Catch(
  ...exceptions: Type<Error>[]
): ClassDecorator {
  return (target: Function) => {
    Reflect.defineMetadata(CATCH_METADATA, exceptions, target);
  };
}

/**
 * @UseFilters() decorator
 * 
 * Apply exception filters to a controller or method.
 */
export function UseFilters(
  ...filters: Type<ExceptionFilter>[]
): ClassDecorator & MethodDecorator {
  return function (
    target: Object | Function,
    propertyKey?: string | symbol,
    descriptor?: TypedPropertyDescriptor<any>
  ) {
    if (descriptor) {
      // Method decorator
      const existing: Type<ExceptionFilter>[] =
        Reflect.getMetadata(EXCEPTION_FILTER_METADATA, descriptor.value) || [];
      Reflect.defineMetadata(
        EXCEPTION_FILTER_METADATA,
        [...filters, ...existing],
        descriptor.value
      );
      return descriptor;
    } else {
      // Class decorator
      const existing: Type<ExceptionFilter>[] =
        Reflect.getMetadata(EXCEPTION_FILTER_METADATA, target) || [];
      Reflect.defineMetadata(
        EXCEPTION_FILTER_METADATA,
        [...filters, ...existing],
        target
      );
    }
  } as ClassDecorator & MethodDecorator;
}

/**
 * Get exception filters for a controller and method
 */
export function getExceptionFilters(
  controllerClass: Type,
  methodName: string
): Type<ExceptionFilter>[] {
  const controllerFilters: Type<ExceptionFilter>[] =
    Reflect.getMetadata(EXCEPTION_FILTER_METADATA, controllerClass) || [];
  
  const methodFilters: Type<ExceptionFilter>[] =
    Reflect.getMetadata(
      EXCEPTION_FILTER_METADATA,
      controllerClass.prototype[methodName]
    ) || [];

  return [...methodFilters, ...controllerFilters];
}

/**
 * Default exception filter that handles all exceptions
 */
export class DefaultExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): Response {
    const response = host.getResponse();
    
    if (exception instanceof HttpException) {
      return response
        .status(exception.statusCode)
        .json({
          statusCode: exception.statusCode,
          message: exception.message,
          error: exception.name,
        });
    }

    console.error('[ExceptionFilter] Unhandled error:', exception);
    
    return response.status(500).json({
      statusCode: 500,
      message: 'Internal Server Error',
      error: 'InternalServerError',
    });
  }
}

/**
 * Error page configuration
 */
export interface ErrorPagesConfig {
  404?: React.ComponentType<any>;
  401?: React.ComponentType<any>;
  403?: React.ComponentType<any>;
  500?: React.ComponentType<any>;
  [key: string]: React.ComponentType<any> | undefined;
}

/**
 * JSX Exception Filter for rendering error pages
 */
export class JsxExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly errorPages: ErrorPagesConfig = {},
    private readonly layout?: React.ComponentType<any>
  ) {}

  catch(exception: Error, host: ArgumentsHost): Response {
    const response = host.getResponse();
    const request = host.getRequest();
    
    let statusCode = 500;
    
    if (exception instanceof HttpException) {
      statusCode = exception.statusCode;
    }

    // Get error page component
    const ErrorPage = this.errorPages[statusCode.toString()];
    
    if (ErrorPage) {
      const props = {
        message: exception.message,
        statusCode,
        path: new URL(request.url).pathname,
      };

      try {
        let element: React.ReactElement;
        
        if (this.layout) {
          element = React.createElement(this.layout, {
            title: `${statusCode} - Error`,
            children: React.createElement(ErrorPage, props),
          });
        } else {
          element = React.createElement(ErrorPage, props);
        }

        const html = renderToString(element);
        return response.status(statusCode).html(html);
      } catch (renderError) {
        console.error('[JsxExceptionFilter] Error rendering error page:', renderError);
      }
    }

    // Fallback to JSON response
    return response.status(statusCode).json({
      statusCode,
      message: exception.message,
      path: new URL(request.url).pathname,
    });
  }
}

/**
 * Handle an exception with filters
 */
export async function handleException(
  exception: Error,
  request: Request,
  context: ExecutionContext | null,
  filters: Type<ExceptionFilter>[],
  globalFilters: ExceptionFilter[] = []
): Promise<Response> {
  const container = getContainer();
  const responseBuilder = createResponseBuilder();

  const host: ArgumentsHost = {
    getRequest: () => request,
    getResponse: () => responseBuilder,
    getContext: () => context,
  };

  // Try method/controller filters first
  for (const filterClass of filters) {
    const filter = container.resolve(filterClass);
    const catchTypes: Type<Error>[] =
      Reflect.getMetadata(CATCH_METADATA, filterClass) || [];

    // Check if this filter handles this exception type
    if (
      catchTypes.length === 0 ||
      catchTypes.some((type) => exception instanceof type)
    ) {
      return filter.catch(exception, host);
    }
  }

  // Try global filters
  for (const filter of globalFilters) {
    const catchTypes: Type<Error>[] =
      Reflect.getMetadata(CATCH_METADATA, filter.constructor) || [];

    if (
      catchTypes.length === 0 ||
      catchTypes.some((type) => exception instanceof type)
    ) {
      return filter.catch(exception, host);
    }
  }

  // Fallback to default filter
  const defaultFilter = new DefaultExceptionFilter();
  return defaultFilter.catch(exception, host);
}
