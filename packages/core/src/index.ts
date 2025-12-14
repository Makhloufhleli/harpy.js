// Core exports
export { autoWrapClientComponent } from "./core/client-component-wrapper";
export { hydrationContext, initializeHydrationContext } from "./core/hydration";
export { getChunkPath, getHydrationManifest } from "./core/hydration-manifest";
export { withJsxEngine } from "./core/jsx.engine";
export { LiveReloadController } from "./core/live-reload.controller";
export { StaticAssetsController } from "./core/static-assets.controller";

// Exception filter & error pages
export { JsxExceptionFilter } from "./core/jsx-exception.filter";
export type { ErrorPagesConfig } from "./core/jsx-exception.filter";
export { default as Default404Page } from "./core/error-pages/default-404";
export { default as Default500Page } from "./core/error-pages/default-500";
export { default as Default401Page } from "./core/error-pages/default-401";
export { default as Default403Page } from "./core/error-pages/default-403";
export { default as ErrorLayout } from "./core/error-pages/error-layout";

// Decorators
export { JsxRender } from "./decorators/jsx.decorator";
export { WithLayout } from "./decorators/layout.decorator";
export type { MetaOptions, RenderOptions } from "./decorators/jsx.decorator";

// SEO Module
export { SeoModule, BaseSeoService, DefaultSeoService } from "./seo";
export type { SitemapUrl, RobotsConfig, SeoModuleOptions } from "./seo";

// I18n is provided in a separate package: @harpy-js/i18n
// Consumers should import i18n types and modules from that package.

// Types
export type { JsxLayout, JsxLayoutProps, PageProps } from "./types/jsx.types";
export { RouterModule } from "./core/router.module";
export { NavigationService } from "./core/navigation.service";
export { AutoRegisterModule } from "./core/auto-register.module";
export type { NavItem, NavSection } from "./core/types/nav.types";
export type { NavigationRegistry } from "./core/types/nav.types";
export { configureHarpyApp, HarpyAppOptions } from "./core/app-setup";
export { setupHarpyApp } from "./core/app-setup";
export { default as Link } from "./client/Link";
export {
  buildHrefIndex,
  getActiveItemIdFromIndex,
  getActiveItemIdFromManifest,
} from "./client/getActiveItemId";
export { useI18n } from "./client/use-i18n";
