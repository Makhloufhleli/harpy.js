/**
 * Client-side navigation system for SPA-style routing
 * Handles pushState/popstate events and page transitions
 */

interface NavigationOptions {
  /** Element selector where content will be replaced */
  contentSelector?: string;
  /** Callback before navigation starts */
  onBeforeNavigate?: (url: string) => void;
  /** Callback after navigation completes */
  onAfterNavigate?: (url: string) => void;
  /** Callback on navigation error */
  onError?: (error: Error) => void;
}

interface PageData {
  html: string;
  title?: string;
  meta?: Record<string, any>;
}

/**
 * Client-side navigation manager
 */
export class NavigationManager {
  private options: Required<NavigationOptions>;
  private isNavigating = false;
  private cache = new Map<string, PageData>();

  constructor(options: NavigationOptions = {}) {
    this.options = {
      contentSelector: options.contentSelector || '#app',
      onBeforeNavigate: options.onBeforeNavigate || (() => {}),
      onAfterNavigate: options.onAfterNavigate || (() => {}),
      onError: options.onError || ((error) => console.error('[Navigation]', error)),
    };
  }

  /**
   * Initialize the navigation system
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Listen for popstate events (back/forward buttons)
    window.addEventListener('popstate', this.handlePopState);

    console.log('[Navigation] Client-side navigation initialized');
  }

  /**
   * Clean up event listeners
   */
  destroy(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('popstate', this.handlePopState);
  }

  /**
   * Handle browser back/forward navigation
   */
  private handlePopState = async (event: PopStateEvent): Promise<void> => {
    const url = window.location.pathname + window.location.search;
    await this.navigateToUrl(url);
  };

  /**
   * Navigate to a URL using client-side routing
   */
  async navigateToUrl(url: string): Promise<void> {
    if (this.isNavigating) {
      console.log('[Navigation] Navigation already in progress');
      return;
    }

    this.isNavigating = true;
    this.options.onBeforeNavigate(url);

    try {
      // Check cache first
      let pageData = this.cache.get(url);

      if (!pageData) {
        // Fetch the page content
        pageData = await this.fetchPage(url);
        this.cache.set(url, pageData);
      }

      // Update the page
      await this.updatePage(pageData);

      this.options.onAfterNavigate(url);
    } catch (error) {
      this.options.onError(error as Error);
      // Fallback to full page load
      window.location.assign(url);
    } finally {
      this.isNavigating = false;
    }
  }

  /**
   * Fetch page content from server
   */
  private async fetchPage(url: string): Promise<PageData> {
    const response = await fetch(url, {
      headers: {
        'X-Harpy-SPA': 'true', // Signal to server we want SPA navigation
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Parse the HTML to extract title and other metadata
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const title = doc.querySelector('title')?.textContent || '';

    return { html, title };
  }

  /**
   * Update the current page with new content
   */
  private async updatePage(pageData: PageData): Promise<void> {
    // Update document title
    if (pageData.title) {
      document.title = pageData.title;
    }

    // Parse new HTML
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(pageData.html, 'text/html');

    // Get the content container
    const contentSelector = this.options.contentSelector;
    const oldContent = document.querySelector(contentSelector);
    const newContent = newDoc.querySelector(contentSelector);

    if (!oldContent || !newContent) {
      throw new Error(`Content selector "${contentSelector}" not found`);
    }

    // Replace content
    oldContent.innerHTML = newContent.innerHTML;

    // Re-run hydration if available
    if (typeof (window as any).__HARPY_HYDRATION__ !== 'undefined') {
      await this.rehydrate();
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Re-hydrate client components after navigation
   */
  private async rehydrate(): Promise<void> {
    // Import hydration runtime
    try {
      const { hydrateAll } = await import('./hydration-runtime');
      
      // Re-hydrate all components (reads from window.__HARPY_HYDRATION__)
      hydrateAll();
      
      console.log('[Navigation] Re-hydrated components');
    } catch (error) {
      console.error('[Navigation] Hydration error:', error);
    }
  }

  /**
   * Prefetch a URL for faster navigation
   */
  async prefetch(url: string): Promise<void> {
    if (this.cache.has(url)) return;

    try {
      const pageData = await this.fetchPage(url);
      this.cache.set(url, pageData);
      console.log(`[Navigation] Prefetched ${url}`);
    } catch (error) {
      console.error(`[Navigation] Prefetch failed for ${url}:`, error);
    }
  }

  /**
   * Clear the navigation cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Global navigation manager instance
let navigationManager: NavigationManager | null = null;

/**
 * Initialize global navigation
 */
export function initNavigation(options?: NavigationOptions): NavigationManager {
  if (typeof window === 'undefined') {
    throw new Error('Navigation can only be initialized in browser environment');
  }

  if (!navigationManager) {
    navigationManager = new NavigationManager(options);
    navigationManager.init();
  }

  return navigationManager;
}

/**
 * Get the global navigation manager
 */
export function getNavigation(): NavigationManager | null {
  return navigationManager;
}

/**
 * Navigate to a URL programmatically
 */
export function navigate(url: string, replace = false): void {
  if (!navigationManager) {
    console.warn('[Navigation] Not initialized, falling back to full page load');
    window.location.assign(url);
    return;
  }

  const method = replace ? 'replaceState' : 'pushState';
  window.history[method]({}, '', url);
  navigationManager.navigateToUrl(url);
}
