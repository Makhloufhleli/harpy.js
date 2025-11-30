import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import {
  setupHarpyApp,
  type HarpyAppOptions,
} from "@hepta-solutions/harpy-core";
import DefaultLayout from "./layouts/layout";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Centralized Harpy setup: JSX engine, cookies, and static handlers
  await setupHarpyApp(app, { layout: DefaultLayout, distDir: "dist" });

  await app.listen({
    port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
    host: "0.0.0.0",
  });

  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
