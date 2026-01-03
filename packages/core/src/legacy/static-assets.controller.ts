import { FastifyReply } from "fastify";
import * as fs from "fs";
import * as path from "path";

/**
 * Static Assets Controller - Serves framework assets like live-reload client
 */
export class StaticAssetsController {
  liveReloadScript(reply: FastifyReply): void {
    const scriptPath = path.join(__dirname, "live-reload-client.js");

    if (fs.existsSync(scriptPath)) {
      const script = fs.readFileSync(scriptPath, "utf-8");
      reply.type("application/javascript").send(script);
    } else {
      reply.code(404).send("Live reload script not found");
    }
  }
}
