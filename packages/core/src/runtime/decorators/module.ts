import 'reflect-metadata';
import { Type, Provider, getContainer } from '../di';

/**
 * Metadata keys for module system
 */
export const MODULE_METADATA = {
  MODULE: Symbol('harpy:module'),
  IMPORTS: 'harpy:imports',
  CONTROLLERS: 'harpy:controllers',
  PROVIDERS: 'harpy:providers',
  EXPORTS: 'harpy:exports',
  GLOBAL: Symbol('harpy:global'),
} as const;

/**
 * Module metadata options
 */
export interface ModuleMetadata {
  /**
   * Imported modules that export providers needed by this module
   */
  imports?: Type[];

  /**
   * Controllers that handle incoming requests
   */
  controllers?: Type[];

  /**
   * Providers (services) available within this module
   */
  providers?: Provider[];

  /**
   * Providers that should be exported and available to other modules
   */
  exports?: (Type | string | symbol)[];
}

/**
 * Internal module definition used by the runtime
 */
export interface ModuleDefinition {
  /** The module class */
  target: Type;
  /** Module metadata */
  metadata: ModuleMetadata;
  /** Whether this module is global */
  isGlobal: boolean;
  /** Resolved providers for this module */
  resolvedProviders: Map<any, any>;
  /** Imported module definitions */
  importedModules: ModuleDefinition[];
}

/**
 * Registry to store all module definitions
 */
export class ModuleRegistry {
  private static instance: ModuleRegistry | null = null;
  private modules = new Map<Type, ModuleDefinition>();
  private globalProviders = new Map<any, Provider>();

  static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }

  static resetInstance(): void {
    ModuleRegistry.instance = null;
  }

  /**
   * Register a module
   */
  register(moduleClass: Type, metadata: ModuleMetadata, isGlobal: boolean = false): void {
    const definition: ModuleDefinition = {
      target: moduleClass,
      metadata,
      isGlobal,
      resolvedProviders: new Map(),
      importedModules: [],
    };
    this.modules.set(moduleClass, definition);
  }

  /**
   * Get a module definition
   */
  get(moduleClass: Type): ModuleDefinition | undefined {
    return this.modules.get(moduleClass);
  }

  /**
   * Check if a module is registered
   */
  has(moduleClass: Type): boolean {
    return this.modules.has(moduleClass);
  }

  /**
   * Get all registered modules
   */
  getAll(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Get all controllers from all modules
   */
  getAllControllers(): Type[] {
    const controllers: Type[] = [];
    for (const def of this.modules.values()) {
      if (def.metadata.controllers) {
        controllers.push(...def.metadata.controllers);
      }
    }
    return controllers;
  }

  /**
   * Register a global provider
   */
  registerGlobalProvider(token: any, provider: Provider): void {
    this.globalProviders.set(token, provider);
  }

  /**
   * Get all global providers
   */
  getGlobalProviders(): Map<any, Provider> {
    return this.globalProviders;
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.modules.clear();
    this.globalProviders.clear();
  }
}

/**
 * @Module() decorator
 * 
 * Marks a class as a Harpy module, which is a container for:
 * - Controllers (route handlers)
 * - Providers (services/dependencies)
 * - Imported modules
 * - Exported providers
 * 
 * @example
 * ```typescript
 * @Module({
 *   imports: [DatabaseModule],
 *   controllers: [UserController],
 *   providers: [UserService],
 *   exports: [UserService],
 * })
 * export class UserModule {}
 * ```
 */
export function Module(metadata: ModuleMetadata = {}): ClassDecorator {
  return function (target: Function) {
    // Mark as a module
    Reflect.defineMetadata(MODULE_METADATA.MODULE, true, target);
    
    // Store metadata
    Reflect.defineMetadata(MODULE_METADATA.IMPORTS, metadata.imports || [], target);
    Reflect.defineMetadata(MODULE_METADATA.CONTROLLERS, metadata.controllers || [], target);
    Reflect.defineMetadata(MODULE_METADATA.PROVIDERS, metadata.providers || [], target);
    Reflect.defineMetadata(MODULE_METADATA.EXPORTS, metadata.exports || [], target);

    // Register providers with the DI container
    const container = getContainer();
    for (const provider of metadata.providers || []) {
      container.register(provider);
    }

    // Register with module registry
    const registry = ModuleRegistry.getInstance();
    const isGlobal = Reflect.getMetadata(MODULE_METADATA.GLOBAL, target) || false;
    registry.register(target as Type, metadata, isGlobal);
  };
}

/**
 * @Global() decorator
 * 
 * Marks a module as global, making its exported providers available
 * throughout the application without needing to import it.
 * 
 * @example
 * ```typescript
 * @Global()
 * @Module({
 *   providers: [ConfigService],
 *   exports: [ConfigService],
 * })
 * export class ConfigModule {}
 * ```
 */
export function Global(): ClassDecorator {
  return function (target: Function) {
    Reflect.defineMetadata(MODULE_METADATA.GLOBAL, true, target);
  };
}

/**
 * Get module metadata
 */
export function getModuleMetadata(moduleClass: Type): ModuleMetadata {
  return {
    imports: Reflect.getMetadata(MODULE_METADATA.IMPORTS, moduleClass) || [],
    controllers: Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, moduleClass) || [],
    providers: Reflect.getMetadata(MODULE_METADATA.PROVIDERS, moduleClass) || [],
    exports: Reflect.getMetadata(MODULE_METADATA.EXPORTS, moduleClass) || [],
  };
}

/**
 * Check if a class is a module
 */
export function isModule(target: any): boolean {
  return Reflect.getMetadata(MODULE_METADATA.MODULE, target) === true;
}

/**
 * Get the module registry instance
 */
export function getModuleRegistry(): ModuleRegistry {
  return ModuleRegistry.getInstance();
}
