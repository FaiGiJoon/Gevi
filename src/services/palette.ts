export interface Palette {
  name: string;
  colors: [string, string, string, string]; // 4 colors for GB
}

export class PaletteService {
  private palettes: Record<string, Palette> = {
    "Original": {
      name: "Original",
      colors: ["#9bbc0f", "#8bab0f", "#306230", "#0f380f"]
    },
    "Pocket": {
      name: "Pocket",
      colors: ["#c4cfa1", "#8b956d", "#4d533c", "#1f1f1f"]
    },
    "Light": {
      name: "Light",
      colors: ["#00b29a", "#008a76", "#006253", "#003a31"]
    },
    "Greyscale": {
      name: "Greyscale",
      colors: ["#ffffff", "#aaaaaa", "#555555", "#000000"]
    }
  };

  private currentPalette: string = "Original";

  getPalettes(): string[] {
    return Object.keys(this.palettes);
  }

  getCurrentPalette(): Palette {
    return this.palettes[this.currentPalette]!;
  }

  setPalette(name: string): void {
    if (this.palettes[name]) {
      this.currentPalette = name;
    } else {
      throw new Error(`Palette ${name} not found`);
    }
  }

  addCustomPalette(palette: Palette): void {
    this.palettes[palette.name] = palette;
  }
}
