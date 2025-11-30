import { I18nHelper } from '../i18n.helper';

describe('I18nHelper', () => {
  const baseOptions: any = {
    locales: ['en', 'fr'],
    defaultLocale: 'en',
    urlPattern: 'query',
    queryParam: 'lang',
    cookieName: 'locale',
  };

  it('builds query url with locale param', () => {
    const h = new I18nHelper(baseOptions);
    const res = h.buildLocaleUrl('fr', '/path', { a: '1' });
    expect(res).toContain('/path');
    expect(res).toContain('lang=fr');
  });

  it('returns currentPath for header pattern when no query', () => {
    const opts = { ...baseOptions, urlPattern: 'header' };
    const h = new I18nHelper(opts);
    const res = h.buildLocaleUrl('fr', '/path');
    expect(res).toBe('/path');
  });

  it('sets cookie on response', () => {
    const h = new I18nHelper(baseOptions);
    const res: any = { setCookie: jest.fn() };
    h.setLocaleCookie(res, 'fr');
    expect(res.setCookie).toHaveBeenCalledWith('locale', 'fr', expect.any(Object));
  });

  it('validates locale', () => {
    const h = new I18nHelper(baseOptions);
    expect(h.validateLocale('es')).toBe('en');
    expect(h.validateLocale('fr')).toBe('fr');
  });

  it('returns client config', () => {
    const h = new I18nHelper(baseOptions);
    const cfg = h.getClientConfig();
    expect(cfg.locales).toEqual(['en', 'fr']);
    expect(cfg.defaultLocale).toBe('en');
  });
});
