import { expect, test, describe } from "bun:test";
import { GEVI } from "../src/index";

describe("GEVI Middleware Handler", () => {
  const gevi = new GEVI();

  test("should handle PING command", async () => {
    const res = await gevi.handleCommand({ command: "PING" });
    expect(res).toEqual({ status: "ok", message: "PONG" });
  });

  test("should handle GET_STATUS command", async () => {
    const res = await gevi.handleCommand({ command: "GET_STATUS" });
    expect(res).toEqual({
      status: "ok",
      system: "GEVI",
      version: "1.1.0",
      currentPalette: "Original",
    });
  });

  test("should handle GET_PALETTES and SET_PALETTE commands", async () => {
    const palettesRes = await gevi.handleCommand({ command: "GET_PALETTES" });
    expect(palettesRes?.status).toBe("success");
    expect(palettesRes?.palettes).toContain("Pocket");

    const setRes = await gevi.handleCommand({ command: "SET_PALETTE", paletteName: "Pocket" });
    expect(setRes?.status).toBe("success");
    expect(setRes?.palette?.name).toBe("Pocket");

    const statusRes = await gevi.handleCommand({ command: "GET_STATUS" });
    expect(statusRes?.currentPalette).toBe("Pocket");
  });

  test("should handle INSPECT_MEMORY command", async () => {
    const res = await gevi.handleCommand({
      command: "INSPECT_MEMORY",
      address: 0x0100,
      length: 4,
    });
    expect(res?.status).toBe("success");
    expect(res?.data).toHaveLength(4);
  });

  test("should handle GET_TILES command", async () => {
    const res = await gevi.handleCommand({ command: "GET_TILES", bank: 1 });
    expect(res?.status).toBe("success");
    expect(res?.tileData).toContain("BANK_1");
  });

  test("should handle DISASSEMBLE command", async () => {
    const res = await gevi.handleCommand({
      command: "DISASSEMBLE",
      address: 0x0100,
      length: 2,
    });
    expect(res?.status).toBe("success");
    expect(res?.instructions).toHaveLength(2);
  });

  test("should reject invalid command structure", async () => {
    const res = await gevi.handleCommand({ command: "INVALID_CMD" });
    expect(res?.status).toBe("error");
    expect(res?.message).toBe("Invalid command structure");
  });

  test("should return error when required parameters are missing", async () => {
    const res1 = await gevi.handleCommand({ command: "LOAD_GAME" });
    expect(res1?.status).toBe("error");
    expect(res1?.message).toContain("gameId is required");

    const res2 = await gevi.handleCommand({ command: "INSPECT_MEMORY", address: 0x100 });
    expect(res2?.status).toBe("error");
    expect(res2?.message).toContain("address and length are required");
  });
});
