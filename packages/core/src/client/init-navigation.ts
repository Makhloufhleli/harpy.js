/**
 * Auto-initialize client-side navigation
 * Include this script in your layout to enable SPA-style navigation
 */

import { initNavigation } from './navigation';

if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initNavigation({
        contentSelector: '#app',
        onBeforeNavigate: (url) => {
          console.log(`[Harpy] Navigating to ${url}`);
          // Add loading indicator if desired
          document.body.classList.add('harpy-navigating');
        },
        onAfterNavigate: (url) => {
          console.log(`[Harpy] Navigation complete to ${url}`);
          // Remove loading indicator
          document.body.classList.remove('harpy-navigating');
        },
        onError: (error) => {
          console.error('[Harpy] Navigation error:', error);
          document.body.classList.remove('harpy-navigating');
        },
      });
    });
  } else {
    initNavigation({
      contentSelector: '#app',
      onBeforeNavigate: (url) => {
        document.body.classList.add('harpy-navigating');
      },
      onAfterNavigate: (url) => {
        document.body.classList.remove('harpy-navigating');
      },
      onError: (error) => {
        console.error('[Harpy] Navigation error:', error);
        document.body.classList.remove('harpy-navigating');
      },
    });
  }
}
