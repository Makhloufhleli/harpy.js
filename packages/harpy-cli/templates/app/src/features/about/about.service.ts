import type { MetaOptions } from "@hepta-solutions/harpy-core";
import { Injectable } from "@nestjs/common";

@Injectable()
export class AboutService {
  static async getMetaData(): Promise<MetaOptions> {
    return Promise.resolve({
      title: "About Us - My App",
      description: `Learn more about us.`,
      openGraph: {
        title: "About Us - My App",
        description: `Learn more about us.`,
        type: "article",
        url: "https://example.com/about",
      },
      twitter: {
        card: "summary_large_image",
        title: "About Us - My App",
        description: `Learn more about us.`,
      },
    });
  }

  async getTitle(): Promise<string> {
    return Promise.resolve("About my app");
  }
}
