import React from "react";
import { MetaOptions } from "../decorators/jsx.decorator";

/**
 * Base props interface for all page components.
 * Extend this interface to add custom props to your pages.
 *
 * @example
 * interface HomePage extends PageProps {
 *   items: string[];
 *   user?: User;
 * }
 */
export interface PageProps {
  [key: string]: any;
}

/**
 * Props interface for layout components.
 * Layouts receive the page content as children and optional metadata.
 */
export interface JsxLayoutProps {
  children: React.ReactNode;
  meta?: MetaOptions;
}

/**
 * Type for layout component functions.
 */
export type JsxLayout = (props: JsxLayoutProps) => React.ReactElement;
