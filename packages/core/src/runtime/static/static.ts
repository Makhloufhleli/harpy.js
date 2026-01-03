// Bun provides full node:path compatibility as a built-in
import { extname, normalize, join } from 'node:path';

/**
 * MIME type mapping for common file extensions
 */
const MIME_TYPES: Record<string, string> = {
  // Text
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  
  // Images
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  
  // Fonts
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf',
  
  // Media
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  
  // Documents
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.gz': 'application/gzip',
  
  // Map files
  '.map': 'application/json',
};

/**
 * Get MIME type for a file
 */
export function getMimeType(filepath: string): string {
  const ext = extname(filepath).toLowerCase();
  return MIME_TYPES[ext] || 'application/octet-stream';
}

/**
 * Static file options
 */
export interface StaticOptions {
  /** Max age for cache control (in seconds) */
  maxAge?: number;
  /** Index file to serve for directories */
  index?: string;
  /** Enable etag */
  etag?: boolean;
  /** Custom headers */
  headers?: Record<string, string>;
}

/**
 * Serve a static file
 */
export async function serveStatic(
  filepath: string,
  options: StaticOptions = {}
): Promise<Response | null> {
  const { maxAge = 0, index = 'index.html', etag = true, headers = {} } = options;

  try {
    // Prevent directory traversal
    const normalizedPath = normalize(filepath);
    if (normalizedPath.includes('..')) {
      return null;
    }

    // Check if path exists using Bun.file
    let file = Bun.file(normalizedPath);
    let exists = await file.exists();

    // Try index file for directories
    if (!exists && !extname(normalizedPath)) {
      const indexPath = join(normalizedPath, index);
      file = Bun.file(indexPath);
      exists = await file.exists();
    }

    if (!exists) {
      return null;
    }

    const responseHeaders = new Headers(headers);
    
    // Set content type - use Bun.file's type or fallback to MIME detection
    const contentType = file.type !== 'application/octet-stream' 
      ? file.type 
      : getMimeType(file.name || normalizedPath);
    responseHeaders.set('Content-Type', contentType);
    
    // Set cache control
    if (maxAge > 0) {
      responseHeaders.set('Cache-Control', `public, max-age=${maxAge}`);
    }

    // Set ETag using Bun.file properties
    if (etag && file.size > 0) {
      // Use file size and last modified for ETag
      const lastModified = file.lastModified;
      const etagValue = `"${file.size.toString(16)}-${lastModified.toString(16)}"`;
      responseHeaders.set('ETag', etagValue);
    }

    return new Response(file, { headers: responseHeaders });
  } catch (error) {
    console.error('[Static] Error serving file:', filepath, error);
    return null;
  }
}

/**
 * Create a static file serving middleware
 */
export function createStaticMiddleware(
  baseDir: string,
  prefix: string = '/',
  options: StaticOptions = {}
): (request: Request, next: () => Promise<Response>) => Promise<Response> {
  return async (request: Request, next: () => Promise<Response>) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Check if path matches prefix
    if (!pathname.startsWith(prefix)) {
      return next();
    }

    // Build file path
    const relativePath = pathname.slice(prefix.length);
    const filepath = join(baseDir, relativePath);

    const response = await serveStatic(filepath, options);
    if (response) {
      return response;
    }

    return next();
  };
}

/**
 * Live reload script content
 */
const LIVE_RELOAD_SCRIPT = `
(function() {
  console.log('[Harpy] Live reload enabled');
  
  let retries = 0;
  const maxRetries = 10;
  
  function connect() {
    const eventSource = new EventSource('/__harpy/live-reload');
    
    eventSource.onopen = function() {
      console.log('[Harpy] Connected to live reload server');
      retries = 0;
    };
    
    eventSource.onmessage = function(event) {
      if (event.data === 'reload') {
        console.log('[Harpy] Reloading page...');
        window.location.reload();
      }
    };
    
    eventSource.onerror = function() {
      eventSource.close();
      if (retries < maxRetries) {
        retries++;
        console.log('[Harpy] Reconnecting in 1s... (attempt ' + retries + ')');
        setTimeout(connect, 1000);
      }
    };
  }
  
  connect();
})();
`;

/**
 * Live reload state
 */
let liveReloadClients: Set<ReadableStreamDefaultController> = new Set();

/**
 * Create a live reload middleware
 */
export function createLiveReloadMiddleware(): (
  request: Request,
  next: () => Promise<Response>
) => Promise<Response> {
  return async (request: Request, next: () => Promise<Response>) => {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Serve live reload script
    if (pathname === '/__harpy/live-reload.js') {
      return new Response(LIVE_RELOAD_SCRIPT, {
        headers: {
          'Content-Type': 'text/javascript; charset=utf-8',
        },
      });
    }

    // SSE endpoint for live reload
    if (pathname === '/__harpy/live-reload') {
      const stream = new ReadableStream({
        start(controller) {
          liveReloadClients.add(controller);
          
          // Send initial connection message
          controller.enqueue('data: connected\n\n');
        },
        cancel() {
          // Remove client on disconnect
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Trigger reload endpoint
    if (pathname === '/__harpy/live-reload/trigger' && request.method === 'POST') {
      triggerLiveReload();
      return new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return next();
  };
}

/**
 * Trigger live reload on all connected clients
 */
export function triggerLiveReload(): void {
  for (const controller of liveReloadClients) {
    try {
      controller.enqueue('data: reload\n\n');
    } catch {
      // Client disconnected
      liveReloadClients.delete(controller);
    }
  }
}

/**
 * Clear all live reload clients
 */
export function clearLiveReloadClients(): void {
  liveReloadClients.clear();
}
