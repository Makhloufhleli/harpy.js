/**
 * Unit tests for canonical redirect logic
 */

describe('Canonical Redirect Logic', () => {
  // Simulate the redirect logic from app-setup.ts
  function shouldRedirect(options: {
    host: string;
    protocol: string;
    mainDomain?: string;
    enforceHttps?: boolean;
    redirectWww?: boolean;
  }): { shouldRedirect: boolean; targetUrl?: string } {
    const { host, protocol, mainDomain, enforceHttps = true, redirectWww = true } = options;
    
    const normalizedHost = host.replace(/:\d+$/, '');
    
    // Skip redirects for localhost/127.0.0.1
    if (normalizedHost === 'localhost' || normalizedHost === '127.0.0.1' || normalizedHost === '0.0.0.0') {
      return { shouldRedirect: false };
    }

    const proto = protocol;
    
    // Decide whether to redirect
    const isHttp = enforceHttps && proto !== 'https';
    const isWww = redirectWww && normalizedHost.startsWith('www.');
    const hostMismatch = mainDomain && normalizedHost !== mainDomain && normalizedHost !== `www.${mainDomain}`;

    if (isHttp || isWww || hostMismatch) {
      const targetHost = mainDomain ? mainDomain : normalizedHost.replace(/^www\./, '');
      const targetProto = enforceHttps ? 'https' : proto;
      const targetUrl = `${targetProto}://${targetHost}/`;
      
      return { shouldRedirect: true, targetUrl };
    }

    return { shouldRedirect: false };
  }

  describe('HTTP to HTTPS redirect', () => {
    it('should redirect http://harpyjs.org to https://harpyjs.org', () => {
      const result = shouldRedirect({
        host: 'harpyjs.org',
        protocol: 'http',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetUrl).toBe('https://harpyjs.org/');
    });

    it('should not redirect https://harpyjs.org', () => {
      const result = shouldRedirect({
        host: 'harpyjs.org',
        protocol: 'https',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(false);
    });
  });

  describe('WWW to non-WWW redirect', () => {
    it('should redirect www.harpyjs.org to harpyjs.org', () => {
      const result = shouldRedirect({
        host: 'www.harpyjs.org',
        protocol: 'https',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetUrl).toBe('https://harpyjs.org/');
    });

    it('should not redirect when redirectWww is false', () => {
      const result = shouldRedirect({
        host: 'www.harpyjs.org',
        protocol: 'https',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: false,
      });
      
      expect(result.shouldRedirect).toBe(false);
    });
  });

  describe('Combined redirects', () => {
    it('should redirect http://www.harpyjs.org to https://harpyjs.org', () => {
      const result = shouldRedirect({
        host: 'www.harpyjs.org',
        protocol: 'http',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetUrl).toBe('https://harpyjs.org/');
    });
  });

  describe('Localhost exemption', () => {
    it('should not redirect localhost', () => {
      const result = shouldRedirect({
        host: 'localhost',
        protocol: 'http',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(false);
    });

    it('should not redirect 127.0.0.1', () => {
      const result = shouldRedirect({
        host: '127.0.0.1',
        protocol: 'http',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(false);
    });

    it('should not redirect localhost:3000', () => {
      const result = shouldRedirect({
        host: 'localhost:3000',
        protocol: 'http',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(false);
    });
  });

  describe('Domain enforcement', () => {
    it('should redirect different domain to mainDomain', () => {
      const result = shouldRedirect({
        host: 'example.com',
        protocol: 'https',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetUrl).toBe('https://harpyjs.org/');
    });

    it('should not redirect when host matches mainDomain', () => {
      const result = shouldRedirect({
        host: 'harpyjs.org',
        protocol: 'https',
        mainDomain: 'harpyjs.org',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(false);
    });
  });

  describe('Configuration variations', () => {
    it('should not redirect http when enforceHttps is false', () => {
      const result = shouldRedirect({
        host: 'harpyjs.org',
        protocol: 'http',
        mainDomain: 'harpyjs.org',
        enforceHttps: false,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(false);
    });

    it('should work without mainDomain specified', () => {
      const result = shouldRedirect({
        host: 'www.example.com',
        protocol: 'https',
        enforceHttps: true,
        redirectWww: true,
      });
      
      expect(result.shouldRedirect).toBe(true);
      expect(result.targetUrl).toBe('https://example.com/');
    });
  });
});
