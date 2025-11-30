import { RENDER_METADATA } from "@nestjs/common/constants";
import { JsxLayout } from "../core/jsx.engine";

export interface MetaOptions {
  title?: string;
  description?: string;
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    type?: string;
    image?: string;
    url?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface RenderOptions {
  layout?: JsxLayout;
  bootstrapScripts?: string[];
  meta?: MetaResolver;
}

export type MetaResolver<T = any> =
  | MetaOptions
  | ((req: any, data: T) => MetaOptions | Promise<MetaOptions>);

export function JsxRender<T>(
  template: (data: T) => React.JSX.Element,
  options: RenderOptions = {},
): MethodDecorator {
  return (
    target: object,
    key: string | symbol,
    descriptor: TypedPropertyDescriptor<any>,
  ) => {
    Reflect.defineMetadata(
      RENDER_METADATA,
      [template, options],
      descriptor.value,
    );
    return descriptor;
  };
}
