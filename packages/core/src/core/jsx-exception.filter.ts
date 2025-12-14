import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Default404Page from './error-pages/default-404';
import Default500Page from './error-pages/default-500';
import Default401Page from './error-pages/default-401';
import Default403Page from './error-pages/default-403';
import ErrorLayout from './error-pages/error-layout';

export interface ErrorPagesConfig {
  /** Custom 404 Not Found page component */
  404?: React.ComponentType<any>;
  /** Custom 500 Internal Server Error page component */
  500?: React.ComponentType<any>;
  /** Custom 401 Unauthorized page component */
  401?: React.ComponentType<any>;
  /** Custom 403 Forbidden page component */
  403?: React.ComponentType<any>;
  /** Generic error page for other status codes */
  default?: React.ComponentType<any>;
}

/**
 * Global exception filter that renders JSX error pages instead of JSON responses.
 * This filter catches all exceptions and renders appropriate error pages based on
 * the HTTP status code.
 */
@Catch()
export class JsxExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorPages: ErrorPagesConfig = {}) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    // Determine the status code and error message
    let status: number;
    let message: string;
    let error: string | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === 'string') {
        message = response;
      } else if (typeof response === 'object' && response !== null) {
        message =
          (response as any).message || (response as any).error || 'An error occurred';
        error = (response as any).error;
      } else {
        message = 'An error occurred';
      }
    } else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal Server Error';
      error = process.env.NODE_ENV === 'development' ? exception.message : undefined;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Unknown error occurred';
    }

    // Select the appropriate error page component
    let ErrorComponent: React.ComponentType<any>;

    switch (status) {
      case HttpStatus.NOT_FOUND:
        ErrorComponent = this.errorPages[404] || Default404Page;
        break;
      case HttpStatus.UNAUTHORIZED:
        ErrorComponent = this.errorPages[401] || Default401Page;
        break;
      case HttpStatus.FORBIDDEN:
        ErrorComponent = this.errorPages[403] || Default403Page;
        break;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        ErrorComponent = this.errorPages[500] || Default500Page;
        break;
      default:
        ErrorComponent = this.errorPages.default || this.errorPages[500] || Default500Page;
    }

    // Prepare props for the error page
    const props: any = {
      message,
      error,
      path: request.url,
    };

    // Determine the appropriate title for the error page
    const titleMap: Record<number, string> = {
      404: '404 - Page Not Found',
      401: '401 - Unauthorized',
      403: '403 - Forbidden',
      500: '500 - Internal Server Error',
    };
    const title = titleMap[status] || `${status} - Error`;

    // Render the error page wrapped in ErrorLayout for proper styling
    try {
      const errorPageContent = React.createElement(ErrorComponent, props);
      const wrappedInLayout = React.createElement(ErrorLayout, {
        title,
        children: errorPageContent,
      });
      const html = renderToString(wrappedInLayout);

      void reply
        .status(status)
        .header('Content-Type', 'text/html; charset=utf-8')
        .send(`<!DOCTYPE html>${html}`);
    } catch (renderError) {
      // Fallback to JSON if rendering fails
      console.error('Error rendering JSX error page:', renderError);
      void reply.status(status).send({
        statusCode: status,
        message,
        error,
      });
    }
  }
}
