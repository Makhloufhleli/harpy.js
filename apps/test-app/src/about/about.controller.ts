import { Controller, Get } from '@nestjs/common';
import { JsxRender } from 'harpy-core';
import { HomeService } from '../home/home.service';
import { AboutService } from './about.service';
import Aboutpage from './views/aboutpage';

@Controller('about')
export class AboutController {
  constructor(
    private readonly aboutService: AboutService,
    private readonly homeService: HomeService,
  ) {}

  @Get()
  @JsxRender(Aboutpage, {
    async meta(req, data) {
      const metaData = await AboutService.getMetaData();
      return {
        title: metaData.title,
        description: `${metaData.title} We have ${data.items.length} items.`,
        openGraph: metaData.openGraph,
        twitter: metaData.twitter,
      };
    },
  })
  aboutpage() {
    return {
      title: this.aboutService.getTitle(),
      items: this.homeService.getItems(),
    };
  }
}
