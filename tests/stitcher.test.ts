import { expect, test, describe, beforeEach, afterEach } from "bun:test";
import { Stitcher } from "../src/services/stitcher";
import { CardFragment } from "../src/types/card";
import { calculateHash } from "../src/utils/crypto";
import { rm, mkdir } from "node:fs/promises";
import { join } from "node:path";

describe("Stitcher", () => {
  const tempDir = join(import.meta.dir, "temp_stitcher_test");

  beforeEach(async () => {
    await mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true, force: true });
  });

  test("should stitch card fragments in correct index order", async () => {
    const part1 = new Uint8Array([0x10, 0x20]);
    const part2 = new Uint8Array([0x30, 0x40]);

    const hash1 = await calculateHash(part1);
    const hash2 = await calculateHash(part2);

    const file1Path = join(tempDir, "part1.raw");
    const file2Path = join(tempDir, "part2.raw");

    await Bun.write(file1Path, part1);
    await Bun.write(file2Path, part2);

    const fragments: CardFragment[] = [
      {
        cardId: "card2",
        gameId: "game1",
        role: "FOOTER",
        index: 1,
        hash: hash2,
        filePath: file2Path,
      },
      {
        cardId: "card1",
        gameId: "game1",
        role: "HEADER",
        index: 0,
        hash: hash1,
        filePath: file1Path,
      },
    ];

    const stitcher = new Stitcher();
    const stitched = await stitcher.stitch(fragments);

    expect(stitched).toEqual(new Uint8Array([0x10, 0x20, 0x30, 0x40]));
  });

  test("should throw error if hash validation fails", async () => {
    const part1 = new Uint8Array([0x10, 0x20]);
    const invalidHash = "0000000000000000000000000000000000000000000000000000000000000000";
    const filePath = join(tempDir, "invalid.raw");

    await Bun.write(filePath, part1);

    const fragments: CardFragment[] = [
      {
        cardId: "card1",
        gameId: "game1",
        role: "HEADER",
        index: 0,
        hash: invalidHash,
        filePath: filePath,
      },
    ];

    const stitcher = new Stitcher();
    expect(stitcher.stitch(fragments)).rejects.toThrow("Integrity check failed for card card1");
  });
});
