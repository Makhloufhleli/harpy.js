import React from "react";

/**
 * Metadata options for SEO and social sharing
 */
export interface MetaOptions {
  title?: string;
  description?: string;
  canonical?: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    type?: string;
    image?: string;
    siteName?: string;
    locale?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
    creator?: string;
    site?: string;
  };
  structuredData?: object | object[];
}

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
