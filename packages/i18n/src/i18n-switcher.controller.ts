import {
  Controller,
  Post,
  Body,
  Req,
  Res,
  Get,
  HttpStatus,
} from "@nestjs/common";
import { I18nHelper } from "./i18n.helper";

@Controller("api/i18n")
export class I18nSwitcherController {
  constructor(private readonly i18nHelper: I18nHelper) {}

  @Post("switch-locale")
  switchLocale(
    @Body("locale") locale: string,
    @Body("redirect") redirectPath: string | undefined,
    @Req() req: any,
    @Res() res: any,
  ) {
    if (!locale) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .send({ success: false, error: "Locale is required" });
    }

    const validatedLocale = this.i18nHelper.validateLocale(locale);
    this.i18nHelper.setLocaleCookie(res, validatedLocale);

    console.log('[I18nSwitcher] Locale switched to:', validatedLocale);
    
    // Return success - client will handle reload
    return res.send({
      success: true,
      locale: validatedLocale,
    });
  }

  @Get("config")
  getConfig() {
    return this.i18nHelper.getClientConfig();
  }
}
