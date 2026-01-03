import { Type, getContainer } from '../di';
import { getModuleRegistry } from '../decorators/module';

/**
 * Lifecycle hook interface for module initialization
 */
export interface OnModuleInit {
  onModuleInit(): void | Promise<void>;
}

/**
 * Lifecycle hook interface for application bootstrap
 */
export interface OnApplicationBootstrap {
  onApplicationBootstrap(): void | Promise<void>;
}

/**
 * Lifecycle hook interface for module destruction
 */
export interface OnModuleDestroy {
  onModuleDestroy(): void | Promise<void>;
}

/**
 * Lifecycle hook interface for before application shutdown
 */
export interface BeforeApplicationShutdown {
  beforeApplicationShutdown(signal?: string): void | Promise<void>;
}

/**
 * Lifecycle hook interface for application shutdown
 */
export interface OnApplicationShutdown {
  onApplicationShutdown(signal?: string): void | Promise<void>;
}

/**
 * Check if an object implements a lifecycle hook
 */
function hasLifecycleHook(
  instance: any,
  hook: string
): boolean {
  return instance && typeof instance[hook] === 'function';
}

/**
 * Lifecycle hooks manager
 */
export class LifecycleHooksManager {
  private instances: any[] = [];

  /**
   * Register an instance to receive lifecycle events
   */
  register(instance: any): void {
    if (!this.instances.includes(instance)) {
      this.instances.push(instance);
    }
  }

  /**
   * Call onModuleInit on all registered instances
   */
  async callOnModuleInit(): Promise<void> {
    for (const instance of this.instances) {
      if (hasLifecycleHook(instance, 'onModuleInit')) {
        await instance.onModuleInit();
      }
    }
  }

  /**
   * Call onApplicationBootstrap on all registered instances
   */
  async callOnApplicationBootstrap(): Promise<void> {
    for (const instance of this.instances) {
      if (hasLifecycleHook(instance, 'onApplicationBootstrap')) {
        await instance.onApplicationBootstrap();
      }
    }
  }

  /**
   * Call onModuleDestroy on all registered instances
   */
  async callOnModuleDestroy(): Promise<void> {
    for (const instance of this.instances) {
      if (hasLifecycleHook(instance, 'onModuleDestroy')) {
        await instance.onModuleDestroy();
      }
    }
  }

  /**
   * Call beforeApplicationShutdown on all registered instances
   */
  async callBeforeApplicationShutdown(signal?: string): Promise<void> {
    for (const instance of this.instances) {
      if (hasLifecycleHook(instance, 'beforeApplicationShutdown')) {
        await instance.beforeApplicationShutdown(signal);
      }
    }
  }

  /**
   * Call onApplicationShutdown on all registered instances
   */
  async callOnApplicationShutdown(signal?: string): Promise<void> {
    for (const instance of this.instances) {
      if (hasLifecycleHook(instance, 'onApplicationShutdown')) {
        await instance.onApplicationShutdown(signal);
      }
    }
  }

  /**
   * Clear all registered instances
   */
  clear(): void {
    this.instances = [];
  }
}

/**
 * Collect all module and provider instances for lifecycle management
 */
export async function collectLifecycleInstances(
  rootModule: Type,
  visited = new Set<Type>()
): Promise<any[]> {
  const instances: any[] = [];
  const container = getContainer();
  const registry = getModuleRegistry();

  // Helper to collect from a module
  async function collectFromModule(moduleClass: Type): Promise<void> {
    if (visited.has(moduleClass)) return;
    visited.add(moduleClass);

    const moduleDef = registry.get(moduleClass);
    if (!moduleDef) return;

    // Try to resolve module instance
    try {
      const moduleInstance = container.resolve(moduleClass);
      if (moduleInstance) {
        instances.push(moduleInstance);
      }
    } catch {
      // Module might not be injectable
    }

    // Collect from providers
    for (const provider of moduleDef.metadata.providers || []) {
      try {
        const token = typeof provider === 'function' ? provider : (provider as any).provide;
        if (token) {
          const instance = container.resolve(token);
          if (instance && !instances.includes(instance)) {
            instances.push(instance);
          }
        }
      } catch {
        // Provider might not be resolvable yet
      }
    }

    // Collect from controllers
    for (const controller of moduleDef.metadata.controllers || []) {
      try {
        const instance = container.resolve(controller);
        if (instance && !instances.includes(instance)) {
          instances.push(instance);
        }
      } catch {
        // Controller might not be resolvable yet
      }
    }

    // Recursively collect from imports
    for (const imported of moduleDef.metadata.imports || []) {
      await collectFromModule(imported);
    }
  }

  await collectFromModule(rootModule);
  return instances;
}

/**
 * Setup signal handlers for graceful shutdown
 */
export function setupSignalHandlers(
  lifecycleManager: LifecycleHooksManager,
  onShutdown?: () => Promise<void>
): void {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT'];

  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`\n[Harpy] Received ${signal}, shutting down gracefully...`);

      try {
        await lifecycleManager.callBeforeApplicationShutdown(signal);
        await lifecycleManager.callOnModuleDestroy();
        await lifecycleManager.callOnApplicationShutdown(signal);
        
        if (onShutdown) {
          await onShutdown();
        }

        console.log('[Harpy] Shutdown complete');
        process.exit(0);
      } catch (error) {
        console.error('[Harpy] Error during shutdown:', error);
        process.exit(1);
      }
    });
  }
}
