import { expect, test, describe } from "bun:test";
import { DebuggerService } from "../src/services/debugger";

describe("DebuggerService", () => {
  const service = new DebuggerService();

  test("should inspect memory", async () => {
    const data = await service.inspectMemory(0x100, 10);
    expect(data.length).toBe(10);
    expect(data).toBeInstanceOf(Uint8Array);
  });

  test("should get tile data", async () => {
    const tiles = await service.getTileData(1);
    expect(tiles).toContain("BANK_1");
  });

  test("should list save states", async () => {
    const states = await service.listSaveStates("game1");
    expect(states).toContain("state1.sav");
  });
});
