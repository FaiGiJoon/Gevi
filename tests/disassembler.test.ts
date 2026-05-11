import { expect, test, describe } from "bun:test";
import { DisassemblerService } from "../src/services/disassembler";

describe("DisassemblerService", () => {
  const service = new DisassemblerService();

  test("should disassemble instructions at address", async () => {
    const address = 0x100;
    const length = 5;
    const instructions = await service.disassemble(address, length);

    expect(instructions).toHaveLength(length);
    expect(instructions[0]).toContain("0x0100");
    expect(instructions[0]).toContain("LD A, $01");
  });

  test("should handle length longer than mock instructions", async () => {
    const address = 0x200;
    const length = 10;
    const instructions = await service.disassemble(address, length);

    expect(instructions).toHaveLength(length);
    // After 8 mock instructions, it should return NOPs
    expect(instructions[8]).toContain("NOP");
  });
});
