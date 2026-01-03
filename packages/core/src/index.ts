// === Bun Runtime Exports ===
// These are the primary exports for Bun-native applications
export * from "./runtime";

// === Core Client-Side Exports ===
export { autoWrapClientComponent } from "./core/client-component-wrapper";
export { hydrationContext, initializeHydrationContext } from "./core/hydration";
export { getChunkPath, getHydrationManifest } from "./core/hydration-manifest";

// Error pages (static components - no NestJS dependency)
export { default as Default404Page } from "./core/error-pages/default-404";
export { default as Default500Page } from "./core/error-pages/default-500";
export { default as Default401Page } from "./core/error-pages/default-401";
export { default as Default403Page } from "./core/error-pages/default-403";
export { default as ErrorLayout } from "./core/error-pages/error-layout";

// Types
export type { JsxLayout, JsxLayoutProps, PageProps } from "./types/jsx.types";
export type { NavItem, NavSection } from "./core/types/nav.types";
export type { NavigationRegistry } from "./core/types/nav.types";

// Client-side utilities
export { default as Link } from "./client/Link";
export type { LinkProps } from "./client/Link";
export {
  buildHrefIndex,
  getActiveItemIdFromIndex,
  getActiveItemIdFromManifest,
} from "./client/getActiveItemId";
export { useI18n } from "./client/use-i18n";
export {
  NavigationManager,
  initNavigation,
  getNavigation,
  navigate,
} from "./client/navigation";

// Navigation service (pure logic - no framework dependency)
export { NavigationService } from "./core/navigation.service";
