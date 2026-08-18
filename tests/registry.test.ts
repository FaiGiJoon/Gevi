import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { RegistryService } from "../src/services/registry";
import { calculateHash } from "../src/utils/crypto";
import { rm, mkdir } from "node:fs/promises";
import { join } from "node:path";

describe("RegistryService", () => {
  const tempDir = join(import.meta.dir, "temp_registry_test");
  const manifestPath = join(tempDir, "manifest.json");

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("should handle missing manifest file gracefully", async () => {
    const service = new RegistryService(join(tempDir, "non_existent.json"));
    await service.loadManifest();
    const result = await service.reconcileAssets(tempDir);
    expect(result).toEqual({});
  });

  test("should return empty object for invalid/missing directory", async () => {
    const service = new RegistryService(manifestPath);
    const result = await service.reconcileAssets(join(tempDir, "non_existent_dir"));
    expect(result).toEqual({});
  });

  test("should reconcile raw asset files into GameSet", async () => {
    const rawData = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const hash = await calculateHash(rawData);

    const manifest = {
      games: [{ gameId: "game1", gameName: "Test Game", totalCards: 1 }],
      cards: [
        {
          cardId: "card1",
          gameId: "game1",
          gameName: "Test Game",
          role: "HEADER",
          index: 0,
          hash: hash,
        },
      ],
    };

    await Bun.write(manifestPath, JSON.stringify(manifest));
    const rawFilePath = join(tempDir, "card1.raw");
    await Bun.write(rawFilePath, rawData);

    const service = new RegistryService(manifestPath);
    const games = await service.reconcileAssets(tempDir);

    expect(games["game1"]).toBeDefined();
    expect(games["game1"]?.gameName).toBe("Test Game");
    expect(games["game1"]?.totalCards).toBe(1);
    expect(games["game1"]?.isComplete).toBe(true);
    expect(games["game1"]?.fragments).toHaveLength(1);
    expect(games["game1"]?.fragments[0]?.hash).toBe(hash);
  });

  test("should mark game incomplete if total cards count is not met", async () => {
    const rawData = new Uint8Array([0x01, 0x02]);
    const hash = await calculateHash(rawData);

    const manifest = {
      games: [{ gameId: "game2", gameName: "Incomplete Game", totalCards: 2 }],
      cards: [
        {
          cardId: "card1",
          gameId: "game2",
          gameName: "Incomplete Game",
          role: "HEADER",
          index: 0,
          hash: hash,
        },
      ],
    };

    await Bun.write(manifestPath, JSON.stringify(manifest));
    await Bun.write(join(tempDir, "card1.raw"), rawData);

    const service = new RegistryService(manifestPath);
    const games = await service.reconcileAssets(tempDir);

    expect(games["game2"]?.isComplete).toBe(false);
    expect(games["game2"]?.totalCards).toBe(2);
    expect(games["game2"]?.fragments).toHaveLength(1);
  });
});
