import 'reflect-metadata';
import { JsxLayout } from '../core/jsx.engine';

export const LAYOUT_METADATA = 'harpy:layout';

/**
 * Decorator to specify a custom layout for a controller or route handler
 * @param layout - The layout component to use
 * 
 * @example
 * // Apply to entire controller
 * @Controller('auth')
 * @WithLayout(AuthLayout)
 * export class AuthController { }
 * 
 * @example
 * // Apply to specific route
 * @Get('profile')
 * @WithLayout(DashboardLayout)
 * @JsxRender(ProfileView)
 * getProfile() { }
 */
export function WithLayout(layout: JsxLayout): ClassDecorator & MethodDecorator {
  return (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) => {
    if (propertyKey && descriptor) {
      // Method decorator - applied to route handler
      Reflect.defineMetadata(LAYOUT_METADATA, layout, descriptor.value);
      return descriptor;
    } else {
      // Class decorator - applied to controller
      Reflect.defineMetadata(LAYOUT_METADATA, layout, target);
      return target;
    }
  };
}

/**
 * Get the layout for a specific handler or controller
 */
export function getLayoutForHandler(
  handler: Function,
  controllerClass: Function,
): JsxLayout | undefined {
  // Check method-level layout first (highest priority)
  const methodLayout = Reflect.getMetadata(LAYOUT_METADATA, handler);
  if (methodLayout) {
    return methodLayout;
  }

  // Fall back to controller-level layout
  const controllerLayout = Reflect.getMetadata(LAYOUT_METADATA, controllerClass);
  if (controllerLayout) {
    return controllerLayout;
  }

  // No layout specified
  return undefined;
}
