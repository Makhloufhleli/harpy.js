import { JsxRender } from '@hepta-solutions/harpy-core';
import { Controller, Get } from '@nestjs/common';
import { HomeService } from './home.service';
import Homepage, { type PageProps } from './views/homepage';

@Controller()
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  @JsxRender(Homepage, {
    meta: {
      title: 'Welcome to My App',
      description: 'This is the homepage of my awesome app.',
      openGraph: {
        title: 'Welcome to My App',
        description: 'This is the homepage of my awesome app.',
        type: 'website',
        url: 'https://example.com',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Welcome to My App',
        description: 'This is the homepage of my awesome app.',
      },
    },
  })
  homepage(): PageProps {
    return {
      items: this.homeService.getItems(),
    };
  }
}
