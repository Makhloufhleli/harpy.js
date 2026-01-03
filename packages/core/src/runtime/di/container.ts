import 'reflect-metadata';

/**
 * Metadata keys used for dependency injection
 */
export const DI_METADATA = {
  INJECTABLE: Symbol('harpy:injectable'),
  INJECT: Symbol('harpy:inject'),
  SCOPE: Symbol('harpy:scope'),
  PARAM_TYPES: 'design:paramtypes',
} as const;

/**
 * Injection scope for services
 */
export enum Scope {
  /** Single instance shared across the application (default) */
  SINGLETON = 'singleton',
  /** New instance created for each injection */
  TRANSIENT = 'transient',
  /** New instance created for each request */
  REQUEST = 'request',
}

/**
 * Token that can be used to identify a dependency
 */
export type InjectionToken<T = any> = string | symbol | Type<T>;

/**
 * Type representing a class constructor
 */
export type Type<T = any> = new (...args: any[]) => T;

/**
 * Provider definition for custom providers
 */
export interface ClassProvider<T = any> {
  provide: InjectionToken<T>;
  useClass: Type<T>;
  scope?: Scope;
}

export interface ValueProvider<T = any> {
  provide: InjectionToken<T>;
  useValue: T;
}

export interface FactoryProvider<T = any> {
  provide: InjectionToken<T>;
  useFactory: (...args: any[]) => T | Promise<T>;
  inject?: InjectionToken[];
  scope?: Scope;
}

export interface ExistingProvider<T = any> {
  provide: InjectionToken<T>;
  useExisting: InjectionToken<T>;
}

export type Provider<T = any> =
  | Type<T>
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>
  | ExistingProvider<T>;

/**
 * Check if a provider is a class provider
 */
function isClassProvider(provider: Provider): provider is ClassProvider {
  return typeof provider === 'object' && 'useClass' in provider;
}

/**
 * Check if a provider is a value provider
 */
function isValueProvider(provider: Provider): provider is ValueProvider {
  return typeof provider === 'object' && 'useValue' in provider;
}

/**
 * Check if a provider is a factory provider
 */
function isFactoryProvider(provider: Provider): provider is FactoryProvider {
  return typeof provider === 'object' && 'useFactory' in provider;
}

/**
 * Check if a provider is an existing provider
 */
function isExistingProvider(provider: Provider): provider is ExistingProvider {
  return typeof provider === 'object' && 'useExisting' in provider;
}

/**
 * Get the token key for a provider
 */
function getProviderToken(provider: Provider): InjectionToken {
  if (typeof provider === 'function') {
    return provider;
  }
  return provider.provide;
}

/**
 * Lightweight Dependency Injection Container for Harpy
 * 
 * Supports:
 * - Constructor injection via reflection
 * - Singleton, transient, and request-scoped services
 * - Custom providers (class, value, factory, existing)
 * - Circular dependency detection
 */
export class Container {
  private static globalInstance: Container | null = null;

  /** Singleton instances cache */
  private singletons = new Map<InjectionToken, any>();

  /** Provider registry */
  private providers = new Map<InjectionToken, Provider>();

  /** Currently resolving tokens (for circular dependency detection) */
  private resolving = new Set<InjectionToken>();

  /** Request-scoped instance store (per-request) */
  private requestScopedInstances = new WeakMap<object, Map<InjectionToken, any>>();

  /**
   * Get the global container instance
   */
  static getInstance(): Container {
    if (!Container.globalInstance) {
      Container.globalInstance = new Container();
    }
    return Container.globalInstance;
  }

  /**
   * Reset the global container (useful for testing)
   */
  static resetInstance(): void {
    Container.globalInstance = null;
  }

  /**
   * Register a provider in the container
   */
  register<T>(provider: Provider<T>): this {
    const token = getProviderToken(provider);
    this.providers.set(token, provider);
    return this;
  }

  /**
   * Register multiple providers
   */
  registerAll(providers: Provider[]): this {
    for (const provider of providers) {
      this.register(provider);
    }
    return this;
  }

  /**
   * Check if a provider is registered
   */
  has(token: InjectionToken): boolean {
    return this.providers.has(token);
  }

  /**
   * Resolve a dependency from the container
   */
  resolve<T>(token: InjectionToken<T>, requestContext?: object): T {
    // Check if we're in a circular dependency
    if (this.resolving.has(token)) {
      const tokenName = typeof token === 'function' ? token.name : String(token);
      throw new Error(`Circular dependency detected for: ${tokenName}`);
    }

    // Check singleton cache first
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T;
    }

    // Check request-scoped cache
    if (requestContext) {
      const requestCache = this.requestScopedInstances.get(requestContext);
      if (requestCache?.has(token)) {
        return requestCache.get(token) as T;
      }
    }

    // Get provider
    const provider = this.providers.get(token);
    if (!provider) {
      const tokenName = typeof token === 'function' ? token.name : String(token);
      throw new Error(`No provider found for: ${tokenName}`);
    }

    // Mark as resolving
    this.resolving.add(token);

    try {
      const instance = this.createInstance(provider, requestContext);
      const scope = this.getProviderScope(provider);

      // Cache based on scope
      if (scope === Scope.SINGLETON) {
        this.singletons.set(token, instance);
      } else if (scope === Scope.REQUEST && requestContext) {
        let requestCache = this.requestScopedInstances.get(requestContext);
        if (!requestCache) {
          requestCache = new Map();
          this.requestScopedInstances.set(requestContext, requestCache);
        }
        requestCache.set(token, instance);
      }

      return instance as T;
    } finally {
      this.resolving.delete(token);
    }
  }

  /**
   * Create an instance from a provider
   */
  private createInstance(provider: Provider, requestContext?: object): any {
    if (typeof provider === 'function') {
      return this.instantiateClass(provider, requestContext);
    }

    if (isValueProvider(provider)) {
      return provider.useValue;
    }

    if (isClassProvider(provider)) {
      return this.instantiateClass(provider.useClass, requestContext);
    }

    if (isFactoryProvider(provider)) {
      const deps = (provider.inject || []).map((dep) =>
        this.resolve(dep, requestContext)
      );
      return provider.useFactory(...deps);
    }

    if (isExistingProvider(provider)) {
      return this.resolve(provider.useExisting, requestContext);
    }

    throw new Error('Unknown provider type');
  }

  /**
   * Instantiate a class with its dependencies
   */
  private instantiateClass<T>(target: Type<T>, requestContext?: object): T {
    // Check if the class is injectable
    const isInjectable = Reflect.getMetadata(DI_METADATA.INJECTABLE, target);
    if (!isInjectable) {
      console.warn(
        `Warning: ${target.name} is not marked as @Injectable(). ` +
        `Consider adding the decorator for proper DI support.`
      );
    }

    // Get constructor parameter types via reflection
    const paramTypes: Type[] =
      Reflect.getMetadata(DI_METADATA.PARAM_TYPES, target) || [];

    // Get any @Inject() overrides
    const injectTokens: Map<number, InjectionToken> =
      Reflect.getMetadata(DI_METADATA.INJECT, target) || new Map();

    // Resolve all dependencies
    const deps = paramTypes.map((type, index) => {
      const token = injectTokens.get(index) || type;
      if (!token || token === Object) {
        throw new Error(
          `Cannot resolve dependency at index ${index} for ${target.name}. ` +
          `Make sure to use @Inject() for interface or abstract dependencies.`
        );
      }
      return this.resolve(token, requestContext);
    });

    return new target(...deps);
  }

  /**
   * Get the scope of a provider
   */
  private getProviderScope(provider: Provider): Scope {
    if (typeof provider === 'function') {
      return Reflect.getMetadata(DI_METADATA.SCOPE, provider) || Scope.SINGLETON;
    }
    if ('scope' in provider && provider.scope) {
      return provider.scope;
    }
    if (isClassProvider(provider)) {
      return Reflect.getMetadata(DI_METADATA.SCOPE, provider.useClass) || Scope.SINGLETON;
    }
    return Scope.SINGLETON;
  }

  /**
   * Clear all singleton instances (useful for testing)
   */
  clearSingletons(): void {
    this.singletons.clear();
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.singletons.clear();
    this.providers.clear();
    this.resolving.clear();
  }
}

/**
 * Get the global container instance
 */
export function getContainer(): Container {
  return Container.getInstance();
}
