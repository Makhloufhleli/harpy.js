import { of } from "rxjs";
import { I18nInterceptor } from "../i18n.interceptor";

describe("I18nInterceptor (unit)", () => {
  const options = {
    locales: ["en", "fr", "es"],
    defaultLocale: "en",
    urlPattern: "query",
    queryParam: "lang",
    cookieName: "locale",
  } as any;

  it("should extract locale from query and set cookie header when different from cookie", (done) => {
    const interceptor = new I18nInterceptor(options);

    const req: any = {
      query: { lang: "fr" },
      headers: {},
    };
    const res: any = { header: jest.fn() };

    const context: any = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    };

    const handler = { handle: () => of({ ok: true }) } as any;

    interceptor.intercept(context as any, handler).subscribe((result) => {
      expect(req.locale).toBe("fr");
      expect(res.header).toHaveBeenCalled();
      const arg = (res.header as jest.Mock).mock.calls[0][1] as string;
      expect(arg).toContain("locale=fr");
      expect(result).toEqual({ ok: true });
      done();
    });
  });

  it("should fall back to cookie value when query/header not present", (done) => {
    const interceptor = new I18nInterceptor(options);

    const req: any = { query: {}, headers: { cookie: "locale=es" } };
    const res: any = { header: jest.fn() };
    const context: any = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    };
    const handler = { handle: () => of("pong") } as any;

    interceptor.intercept(context as any, handler).subscribe((r) => {
      expect(req.locale).toBe("es");
      expect(res.header).not.toHaveBeenCalled();
      expect(r).toBe("pong");
      done();
    });
  });

  it("should use accept-language header when no cookie/query/header pattern matches", (done) => {
    const interceptor = new I18nInterceptor(options);
    const req: any = {
      query: {},
      headers: { "accept-language": "fr-FR, en;q=0.8" },
    };
    const res: any = { header: jest.fn() };
    const context: any = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    };
    const handler = { handle: () => of({}) } as any;

    interceptor.intercept(context as any, handler).subscribe(() => {
      expect(req.locale).toBe("fr");
      done();
    });
  });

  it("should use default locale when nothing matches", (done) => {
    const interceptor = new I18nInterceptor(options);
    const req: any = { query: {}, headers: {} };
    const res: any = { header: jest.fn() };
    const context: any = {
      switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
    };
    const handler = { handle: () => of("x") } as any;

    interceptor.intercept(context as any, handler).subscribe((r) => {
      expect(req.locale).toBe("en");
      expect(r).toBe("x");
      done();
    });
  });
});
