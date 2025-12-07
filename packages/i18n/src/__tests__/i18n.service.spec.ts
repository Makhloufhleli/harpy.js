import { I18nService } from "../i18n.service";

describe("I18nService", () => {
  it("returns default locale when request has none", async () => {
    const req: any = {};
    const options: any = { defaultLocale: "en" };
    const svc = new I18nService(req, options);
    expect(svc.getLocale()).toBe("en");
  });

  it("uses registered dictionary loader and translates keys", async () => {
    const req: any = { locale: "fr" };
    const options: any = { defaultLocale: "en" };
    const svc = new I18nService(req, options);

    svc.registerDictionaryLoader(async () => {
      return { greeting: { hello: "Bonjour {{name}}" } };
    });

    const translated = await svc.translate("greeting.hello", { name: "Paul" });
    expect(translated).toBe("Bonjour Paul");
  });

  it("returns empty string when key not found or not string", async () => {
    const req: any = { locale: "en" };
    const options: any = { defaultLocale: "en" };
    const svc = new I18nService(req, options);

    svc.registerDictionaryLoader(async () => ({ nested: { obj: {} } }));
    const res = await svc.translate("nested.obj");
    expect(res).toBe("");
  });
});
