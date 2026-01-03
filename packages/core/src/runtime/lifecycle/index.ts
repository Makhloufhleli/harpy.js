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
