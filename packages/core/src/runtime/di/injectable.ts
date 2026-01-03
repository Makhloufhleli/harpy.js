import 'reflect-metadata';
import { DI_METADATA, Scope, InjectionToken, getContainer } from './container';

/**
 * Options for the @Injectable() decorator
 */
export interface InjectableOptions {
  /** Scope of the service (default: SINGLETON) */
  scope?: Scope;
}

/**
 * Marks a class as injectable, allowing it to be managed by the DI container.
 * 
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(private readonly db: DatabaseService) {}
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // Request-scoped service
 * @Injectable({ scope: Scope.REQUEST })
 * class RequestContextService {
 *   constructor() {}
 * }
 * ```
 */
export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return function (target: Function) {
    // Mark the class as injectable
    Reflect.defineMetadata(DI_METADATA.INJECTABLE, true, target);

    // Set the scope if provided
    if (options.scope) {
      Reflect.defineMetadata(DI_METADATA.SCOPE, options.scope, target);
    }

    // Auto-register with the global container
    getContainer().register(target as any);
  };
}

/**
 * Decorator to specify a custom injection token for a constructor parameter.
 * Use this when injecting interfaces or abstract classes.
 * 
 * @example
 * ```typescript
 * @Injectable()
 * class UserService {
 *   constructor(
 *     @Inject('DATABASE') private readonly db: IDatabase
 *   ) {}
 * }
 * ```
 */
export function Inject(token: InjectionToken): ParameterDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    // Get existing inject metadata or create new map
    const existingTokens: Map<number, InjectionToken> =
      Reflect.getMetadata(DI_METADATA.INJECT, target) || new Map();

    // Store the token for this parameter index
    existingTokens.set(parameterIndex, token);

    // Save back to metadata
    Reflect.defineMetadata(DI_METADATA.INJECT, existingTokens, target);
  };
}

/**
 * Decorator to mark a class as optional dependency.
 * If the dependency is not found, null will be injected instead of throwing.
 * 
 * @example
 * ```typescript
 * @Injectable()
 * class NotificationService {
 *   constructor(
 *     @Optional() private readonly emailService?: EmailService
 *   ) {}
 * }
 * ```
 */
export function Optional(): ParameterDecorator {
  return function (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) {
    const existingOptionals: Set<number> =
      Reflect.getMetadata('harpy:optional', target) || new Set();
    
    existingOptionals.add(parameterIndex);
    
    Reflect.defineMetadata('harpy:optional', existingOptionals, target);
  };
}
