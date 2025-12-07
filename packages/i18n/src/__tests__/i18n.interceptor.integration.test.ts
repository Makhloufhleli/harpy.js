// Integration test uses runtime require to avoid TS compile-time dependency errors.
describe("I18nInterceptor (integration)", () => {
  let hasDeps = true;
  try {
    // Check if required modules are available at runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require.resolve("@nestjs/testing");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require.resolve("supertest");
  } catch (err) {
    hasDeps = false;
  }

  const describeIf = hasDeps ? describe : describe.skip;

  describeIf("full module integration", () => {
    let app: any;
    beforeAll(async () => {
      // dynamical requires to avoid compile errors when deps aren't present
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { Test } = require("@nestjs/testing");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const common = require("@nestjs/common");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const request = require("supertest");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { I18nInterceptor } = require("../i18n.interceptor");
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { I18N_MODULE_OPTIONS } = require("../i18n-module.options");

      const { Controller, Get, UseInterceptors } = common;

      @Controller()
      @UseInterceptors(I18nInterceptor)
      class TestController {
        @Get("/")
        index() {
          return { ok: true };
        }
      }

      const moduleRef = await Test.createTestingModule({
        controllers: [TestController],
        providers: [
          I18nInterceptor,
          {
            provide: I18N_MODULE_OPTIONS,
            useValue: {
              locales: ["en", "fr"],
              defaultLocale: "en",
              urlPattern: "query",
              queryParam: "lang",
              cookieName: "locale",
            },
          },
        ],
      }).compile();

      app = moduleRef.createNestApplication();
      await app.init();
      // attach to the test context
      (global as any).__TEST_APP__ = { app, request };
    });

    afterAll(async () => {
      if (global && (global as any).__TEST_APP__) {
        await (global as any).__TEST_APP__.app.close();
        delete (global as any).__TEST_APP__;
      }
    });

    it("sets Set-Cookie header when lang query present", async () => {
      const { app: theApp, request } = (global as any).__TEST_APP__;
      const res = await request(theApp.getHttpServer()).get("/?lang=fr");
      const setCookie = res.header["set-cookie"] || res.header["Set-Cookie"];
      expect(setCookie).toBeDefined();
      expect(
        Array.isArray(setCookie) ? setCookie.join("") : setCookie,
      ).toContain("locale=fr");
      expect(res.body).toEqual({ ok: true });
    });
  });
});
