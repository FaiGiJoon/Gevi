import { z } from "zod";
import { RegistryService } from "./services/registry";
import { Stitcher } from "./services/stitcher";
import { logger } from "./services/logger";
import { PaletteService } from "./services/palette";
import { DebuggerService } from "./services/debugger";
import { DisassemblerService } from "./services/disassembler";

// Security Layer: Zod schemas for emulator communication
const CommandSchema = z.object({
  command: z.enum(["LOAD_GAME", "GET_STATUS", "PING", "SET_PALETTE", "GET_PALETTES", "INSPECT_MEMORY", "GET_TILES", "DISASSEMBLE"]),
  gameId: z.string().optional(),
  paletteName: z.string().optional(),
  address: z.number().optional(),
  length: z.number().optional(),
  bank: z.number().optional(),
});

type Command = z.infer<typeof CommandSchema>;

export class GEVI {
  private registry: RegistryService;
  private stitcher: Stitcher;
  private palette: PaletteService;
  private debugger: DebuggerService;
  private disassembler: DisassemblerService;

  constructor() {
    const manifestPath = process.env.MANIFEST_PATH || "./manifest.json";
    this.registry = new RegistryService(manifestPath);
    this.stitcher = new Stitcher();
    this.palette = new PaletteService();
    this.debugger = new DebuggerService();
    this.disassembler = new DisassemblerService();
  }

  async start() {
    await logger.logSystemReady();
    
    console.log("GEVI Middleware started. Waiting for commands...");

    // Keep-alive mechanism: keep the process running
    process.on("SIGINT", () => {
      console.log("Shutting down GEVI...");
      process.exit(0);
    });
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

      const { command, gameId, paletteName, address, length, bank } = result.data;

      switch (command) {
        case "LOAD_GAME":
          if (!gameId) throw new Error("gameId is required for LOAD_GAME");
          return await this.loadGame(gameId);
        case "GET_STATUS":
          return {
              status: "ok",
              system: "GEVI",
              version: "1.1.0",
              currentPalette: this.palette.getCurrentPalette().name
          };
        case "PING":
          return { status: "ok", message: "PONG" };
        case "GET_PALETTES":
          return { status: "success", palettes: this.palette.getPalettes() };
        case "SET_PALETTE":
          if (!paletteName) throw new Error("paletteName is required");
          this.palette.setPalette(paletteName);
          return { status: "success", palette: this.palette.getCurrentPalette() };
        case "INSPECT_MEMORY":
          if (address === undefined || length === undefined) throw new Error("address and length are required");
          const mem = await this.debugger.inspectMemory(address, length);
          return { status: "success", data: Array.from(mem) };
        case "GET_TILES":
          const tiles = await this.debugger.getTileData(bank ?? 0);
          return { status: "success", tileData: tiles };
        case "DISASSEMBLE":
          if (address === undefined || length === undefined) throw new Error("address and length are required");
          const instructions = await this.disassembler.disassemble(address, length);
          return { status: "success", instructions };
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
    };
  }

  getPaletteService() { return this.palette; }
  getRegistryService() { return this.registry; }
}

if (import.meta.main) {
    const gevi = new GEVI();
    gevi.start().catch(console.error);
}
