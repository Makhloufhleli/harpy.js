import React, { AnchorHTMLAttributes, MouseEvent, useCallback } from 'react';

export type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  replace?: boolean;
};

/**
 * A drop-in replacement for an `<a>` tag that performs client-side
 * navigation for same-origin/internal links and falls back to a normal
 * anchor for external links or when modifier keys / non-primary buttons
 * are used. This keeps behaviour identical to a native `<a>` while
 * enabling SPA-style history navigation when appropriate.
 */
export default function Link({ href = '#', onClick, replace, ...rest }: LinkProps) {
  const isLocal = typeof href === 'string' && href.startsWith('/');

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e as unknown as any);
      }

      // If the event was already handled by a consumer, do nothing.
      if (e.defaultPrevented) return;

      // Let the browser handle clicks that intend to open a new tab/window
      // or use a non-primary button.
      if (
        e.button !== 0 ||
        e.metaKey ||
        e.altKey ||
        e.ctrlKey ||
        e.shiftKey
      ) {
        return;
      }

      // External links: allow browser default.
      if (!isLocal) return;

      // Prevent full page reload and update history instead.
      e.preventDefault();

      try {
        const method = replace ? 'replaceState' : 'pushState';
        // @ts-ignore DOM typings are available in consumer environments
        window.history[method]({}, '', href as string);
        // Inform any listeners (e.g., client-side router) that the location changed.
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch (err) {
        // If anything goes wrong, fall back to normal navigation.
        // Do a full navigation as a last resort.
        window.location.assign(href as string);
      }
    },
    [href, isLocal, onClick, replace],
  );

  // Render a normal anchor for full compatibility (SEO, right-click,
  // middle-click, screen readers). We only intercept clicks when it's
  // safe to do SPA-style navigation.
  return (
    <a href={href} onClick={handleClick} {...rest} />
  );
}
