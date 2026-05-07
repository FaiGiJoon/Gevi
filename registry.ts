import { z } from "zod";
import { RegistryService } from "./services/registry";
import { Stitcher } from "./services/stitcher";
import { logger } from "./services/logger";

// Security Layer: Zod schemas for emulator communication
const CommandSchema = z.object({
  command: z.enum(["LOAD_GAME", "GET_STATUS", "PING"]),
  gameId: z.string().optional(),
});

type Command = z.infer<typeof CommandSchema>;

class GEVI {
  private registry: RegistryService;
  private stitcher: Stitcher;

  constructor() {
    const manifestPath = process.env.MANIFEST_PATH || "./manifest.json";
    this.registry = new RegistryService(manifestPath);
    this.stitcher = new Stitcher();
  }

  async start() {
    await logger.logSystemReady();
    
    // In a real implementation, this would start a WebSocket or Pipe listener
    console.log("GEVI Middleware started. Waiting for commands...");

    // Keep-alive mechanism: keep the process running
    process.on("SIGINT", () => {
      console.log("Shutting down GEVI...");
      process.exit(0);
    });

    // Dummy interval to prevent immediate exit
    setInterval(() => {}, 1000);
  }

  /**
   * Middleware handler for emulator commands.
   * Validates input using Zod before execution.
   */
  async handleCommand(rawInput: unknown) {
    try {
      const result = CommandSchema.safeParse(rawInput);
      
      if (!result.success) {
        await logger.log("Invalid command received", "ERROR");
        return { status: "error", message: "Invalid command structure", details: result.error.format() };
      }

      const { command, gameId } = result.data;

      switch (command) {
        case "LOAD_GAME":
          if (!gameId) throw new Error("gameId is required for LOAD_GAME");
          return await this.loadGame(gameId);
        case "GET_STATUS":
          return { status: "ok", system: "GEVI", version: "1.0.0" };
        case "PING":
          return { status: "ok", message: "PONG" };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await logger.log(`Command execution failed: ${errorMessage}`, "ERROR");
      return { status: "error", message: errorMessage };
    }
  }

  private async loadGame(gameId: string) {
    const assetsDir = process.env.ASSETS_DIR || "./assets";
    const sets = await this.registry.reconcileAssets(assetsDir);
    const gameSet = sets[gameId];

    if (!gameSet) {
      throw new Error(`Game not found in registry: ${gameId}`);
    }

    if (!gameSet.isComplete) {
      throw new Error(`Incomplete card set for game: ${gameSet.gameName} (${gameSet.fragments.length}/${gameSet.totalCards})`);
    }

    const payload = await this.stitcher.stitch(gameSet.fragments);
    await logger.logLoadSuccess(gameSet.gameName);

    return {
      status: "success",
      gameName: gameSet.gameName,
      payloadSize: payload.length,
      // In a real scenario, we'd send the payload to the emulator here
    };
  }
}

const gevi = new GEVI();
gevi.start().catch(console.error);

export { gevi };
