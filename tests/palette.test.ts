import { expect, test, describe } from "bun:test";
import { PaletteService } from "../src/services/palette";

describe("PaletteService", () => {
  const service = new PaletteService();

  test("should have default palettes", () => {
    const palettes = service.getPalettes();
    expect(palettes).toContain("Original");
    expect(palettes).toContain("Pocket");
  });

  test("should change current palette", () => {
    service.setPalette("Pocket");
    expect(service.getCurrentPalette().name).toBe("Pocket");
  });

  test("should throw on invalid palette", () => {
    expect(() => service.setPalette("Invalid")).toThrow();
  });

  test("should add custom palette", () => {
    service.addCustomPalette({
        name: "Custom",
        colors: ["#1", "#2", "#3", "#4"]
    });
    expect(service.getPalettes()).toContain("Custom");
  });
});
