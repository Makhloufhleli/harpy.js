import { FastifyReply } from "fastify";

/**
 * Live Reload Controller - Provides SSE endpoint for development hot-reload
 * Only active in development mode
 */
export class LiveReloadController {
  private clients: FastifyReply[] = [];
  private lastReloadTime = Date.now();

  liveReload(reply: FastifyReply): void {
    // Set headers for SSE
    reply.raw.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });

    // Add client to list
    this.clients.push(reply);

    // Send initial connection message
    reply.raw.write(`data: ${JSON.stringify({ type: "connected" })}\n\n`);

    // Remove client on close
    reply.raw.on("close", () => {
      const index = this.clients.indexOf(reply);
      if (index !== -1) {
        this.clients.splice(index, 1);
      }
    });
  }

  /**
   * Notify all connected clients to reload
   * This should be called when assets are rebuilt
   */
  triggerReload(): { success: boolean } {
    this.notifyReload();
    return { success: true };
  }

  public notifyReload() {
    this.lastReloadTime = Date.now();
    const message = `data: ${JSON.stringify({ type: "reload", timestamp: this.lastReloadTime })}\n\n`;

    this.clients.forEach((client) => {
      try {
        client.raw.write(message);
      } catch (err) {
        // Client disconnected
      }
    });
  }
}
