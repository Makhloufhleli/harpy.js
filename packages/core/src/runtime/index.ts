/**
 * Harpy.js Bun Runtime
 * 
 * A lightweight, decorator-based framework running natively on Bun.
 * 
 * @example
 * ```typescript
 * import { Module, Controller, Get, Injectable, createApp } from '@harpy-js/core/runtime';
 * 
 * @Injectable()
 * class AppService {
 *   getHello() { return 'Hello World!'; }
 * }
 * 
 * @Controller()
 * class AppController {
 *   constructor(private readonly appService: AppService) {}
 * 
 *   @Get()
 *   getHello() {
 *     return this.appService.getHello();
 *   }
 * }
 * 
 * @Module({
 *   controllers: [AppController],
 *   providers: [AppService],
 * })
 * class AppModule {}
 * 
 * const app = await createApp(AppModule);
 * await app.listen(3000);
 * ```
 */

// Re-export reflect-metadata (must be imported first)
import 'reflect-metadata';

// App
export { HarpyFactory, HarpyApp, createApp } from './app';
export type { HarpyAppOptions, CorsOptions, ListenOptions, MiddlewareFunction } from './app';

// DI Container
export {
  Container,
  getContainer,
  Injectable,
  Inject,
  Optional,
  Scope,
  DI_METADATA,
} from './di';
export type {
  InjectionToken,
  Type,
  Provider,
  ClassProvider,
  ValueProvider,
  FactoryProvider,
  ExistingProvider,
  InjectableOptions,
} from './di';

// Decorators
export {
  // Module
  Module,
  Global,
  getModuleMetadata,
  isModule,
  getModuleRegistry,
  ModuleRegistry,
  MODULE_METADATA,
  // Controller
  Controller,
  isController,
  getControllerPath,
  getControllerRoutes,
  getControllerRegistry,
  ControllerRegistry,
  CONTROLLER_METADATA,
  // HTTP Methods
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Options,
  Head,
  All,
  HttpCode,
  Header,
  Redirect,
  HTTP_METADATA,
  // Parameters
  Param,
  Query,
  Body,
  Headers,
  Req,
  Request,
  Res,
  Response,
  Cookies,
  Ip,
  HostParam,
  Session,
  createCustomParamDecorator,
  getParamMetadata,
  extractParams,
  ParamType,
  PARAM_METADATA,
} from './decorators';
export type {
  ModuleMetadata,
  ModuleDefinition,
  ControllerOptions,
  ControllerMetadata,
  RouteMetadata,
  HttpMethod,
  ParamMetadata,
  RequestContext,
} from './decorators';

// Router
export { Router, createRouter } from './router';
export type { CompiledRoute, RouteMatch, ResponseContext, CookieOptions } from './router';

// Middleware
export {
  UseGuards,
  UseInterceptors,
  getGuards,
  getInterceptors,
  runGuards,
  runInterceptors,
  createExecutionContext,
  MIDDLEWARE_METADATA,
} from './middleware';
export type {
  CanActivate,
  HarpyInterceptor,
  CallHandler,
  ExecutionContext,
} from './middleware';

// JSX Engine
export {
  JsxRender,
  WithLayout,
  getJsxRenderMetadata,
  renderJsx,
  initializeChunkCache,
  JSX_RENDER_METADATA,
  // Hydration
  hydrationContext,
  initializeHydrationContext,
  registerClientComponent,
  getClientComponents,
  clearHydrationContext,
  generateInstanceId,
  withHydration,
  ClientBoundary,
  createClientComponent,
  renderClientList,
  // Auto-wrap middleware
  installAutoWrapMiddleware,
  uninstallAutoWrapMiddleware,
  clearAutoWrapCaches,
  // Manifest
  getHydrationManifest,
  loadHydrationManifest,
  getChunkFileName,
  getChunkPath,
  invalidateManifestCache,
} from './jsx';
export type {
  JsxLayout,
  JsxLayoutProps,
  PageProps,
  MetaOptions,
  RenderOptions,
  MetaResolver,
  JsxEngineConfig,
  HydrationContext,
  ClientComponentInstance,
  HydrationManifest,
} from './jsx';

// Static files
export {
  serveStatic,
  getMimeType,
  createStaticMiddleware,
  createLiveReloadMiddleware,
  triggerLiveReload,
  clearLiveReloadClients,
} from './static';
export type { StaticOptions } from './static';

// Cookies
export {
  parseCookies,
  serializeCookie,
  deleteCookie,
  CookieJar,
  createCookieJar,
} from './cookies';

// Exceptions
export {
  HttpException,
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  MethodNotAllowedException,
  ConflictException,
  UnprocessableEntityException,
  InternalServerErrorException,
  ServiceUnavailableException,
  Catch,
  UseFilters,
  getExceptionFilters,
  DefaultExceptionFilter,
  JsxExceptionFilter,
  handleException,
  createResponseBuilder,
  EXCEPTION_FILTER_METADATA,
  CATCH_METADATA,
} from './exceptions';
export type {
  ExceptionFilter,
  ArgumentsHost,
  ResponseBuilder,
  ErrorPagesConfig,
} from './exceptions';

// Lifecycle
export {
  LifecycleHooksManager,
  collectLifecycleInstances,
  setupSignalHandlers,
} from './lifecycle';
export type {
  OnModuleInit,
  OnApplicationBootstrap,
  OnModuleDestroy,
  BeforeApplicationShutdown,
  OnApplicationShutdown,
} from './lifecycle';
