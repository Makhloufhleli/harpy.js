/**
 * Cookie options for setting cookies
 */
export interface CookieOptions {
  /** Max-Age in seconds */
  maxAge?: number;
  /** Expires date */
  expires?: Date;
  /** Cookie path (default: '/') */
  path?: string;
  /** Cookie domain */
  domain?: string;
  /** Secure flag (HTTPS only) */
  secure?: boolean;
  /** HttpOnly flag (not accessible via JS) */
  httpOnly?: boolean;
  /** SameSite policy */
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Parse cookies from a Cookie header string
 * 
 * @param cookieHeader - The Cookie header value
 * @returns Object with cookie key-value pairs
 * 
 * @example
 * ```typescript
 * const cookies = parseCookies(request.headers.get('cookie') || '');
 * console.log(cookies.sessionId);
 * ```
 */
export function parseCookies(cookieHeader: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  
  if (!cookieHeader) {
    return cookies;
  }

  cookieHeader.split(';').forEach((cookie) => {
    const [key, ...valueParts] = cookie.split('=');
    if (key) {
      const trimmedKey = key.trim();
      // Join value parts in case value contains '='
      const value = valueParts.join('=').trim();
      // Decode URI components
      try {
        cookies[trimmedKey] = decodeURIComponent(value);
      } catch {
        cookies[trimmedKey] = value;
      }
    }
  });

  return cookies;
}

/**
 * Serialize a cookie to a Set-Cookie header value
 * 
 * @param name - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 * @returns Set-Cookie header value
 * 
 * @example
 * ```typescript
 * const cookie = serializeCookie('sessionId', 'abc123', {
 *   httpOnly: true,
 *   secure: true,
 *   maxAge: 3600,
 * });
 * headers.append('Set-Cookie', cookie);
 * ```
 */
export function serializeCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): string {
  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.maxAge !== undefined) {
    cookie += `; Max-Age=${options.maxAge}`;
  }

  if (options.expires) {
    cookie += `; Expires=${options.expires.toUTCString()}`;
  }

  if (options.path) {
    cookie += `; Path=${options.path}`;
  } else {
    cookie += '; Path=/';
  }

  if (options.domain) {
    cookie += `; Domain=${options.domain}`;
  }

  if (options.secure) {
    cookie += '; Secure';
  }

  if (options.httpOnly) {
    cookie += '; HttpOnly';
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  return cookie;
}

/**
 * Create a cookie deletion Set-Cookie header
 * 
 * @param name - Cookie name
 * @param options - Cookie options (path and domain should match the original)
 * @returns Set-Cookie header value that expires the cookie
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, 'path' | 'domain'> = {}
): string {
  return serializeCookie(name, '', {
    ...options,
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Cookie helper class for working with cookies in request/response
 */
export class CookieJar {
  private requestCookies: Record<string, string>;
  private setCookies: Array<{ name: string; value: string; options?: CookieOptions }> = [];

  constructor(cookieHeader?: string) {
    this.requestCookies = parseCookies(cookieHeader || '');
  }

  /**
   * Get a cookie value from the request
   */
  get(name: string): string | undefined {
    return this.requestCookies[name];
  }

  /**
   * Check if a cookie exists in the request
   */
  has(name: string): boolean {
    return name in this.requestCookies;
  }

  /**
   * Get all request cookies
   */
  getAll(): Record<string, string> {
    return { ...this.requestCookies };
  }

  /**
   * Set a cookie (will be added to response)
   */
  set(name: string, value: string, options?: CookieOptions): this {
    this.setCookies.push({ name, value, options });
    return this;
  }

  /**
   * Delete a cookie (will be added to response with expiry)
   */
  delete(name: string, options?: Pick<CookieOptions, 'path' | 'domain'>): this {
    this.setCookies.push({
      name,
      value: '',
      options: {
        ...options,
        maxAge: 0,
        expires: new Date(0),
      },
    });
    return this;
  }

  /**
   * Get all Set-Cookie header values for the response
   */
  getSetCookieHeaders(): string[] {
    return this.setCookies.map(({ name, value, options }) =>
      serializeCookie(name, value, options)
    );
  }

  /**
   * Apply all set cookies to response headers
   */
  applyToHeaders(headers: Headers): void {
    for (const cookieValue of this.getSetCookieHeaders()) {
      headers.append('Set-Cookie', cookieValue);
    }
  }
}

/**
 * Create a CookieJar from a Request
 */
export function createCookieJar(request: Request): CookieJar {
  return new CookieJar(request.headers.get('cookie') || undefined);
}
