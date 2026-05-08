import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { Manifest } from '../types/registry';
import { GameSet, CardFragment } from '../types/card';
import { calculateHash } from '../utils/crypto';

export class RegistryService {
  private manifest: Manifest | null = null;

  constructor(private manifestPath: string) {}

  async loadManifest(): Promise<void> {
    const file = Bun.file(this.manifestPath);
    if (await file.exists()) {
      this.manifest = await file.json();
    } else {
      this.manifest = { games: [], cards: [] };
    }
  }

  /**
   * Automatically reconciles disorganized .raw files into functional GameSets.
   */
  async reconcileAssets(directory: string): Promise<Record<string, GameSet>> {
    if (!this.manifest) await this.loadManifest();

    let files: string[] = [];
    try {
        files = await readdir(directory);
    } catch (e) {
        return {};
    }

    const rawFiles = files.filter(f => f.endsWith('.raw'));
    const games: Record<string, GameSet> = {};

    for (const fileName of rawFiles) {
      const filePath = join(directory, fileName);
      const file = Bun.file(filePath);
      const arrayBuffer = await file.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const actualHash = await calculateHash(data);

      const entry = this.manifest?.cards.find(c => c.hash === actualHash);

      if (entry) {
        if (!games[entry.gameId]) {
          games[entry.gameId] = {
            gameId: entry.gameId,
            gameName: entry.gameName,
            totalCards: 0,
            fragments: [],
            isComplete: false,
          };
        }

        const fragment: CardFragment = {
          cardId: entry.cardId,
          gameId: entry.gameId,
          role: entry.role,
          index: entry.index,
          hash: entry.hash,
          filePath: filePath,
        };

        games[entry.gameId].fragments.push(fragment);
      }
    }

    // Determine completion and total cards
    for (const gameId in games) {
      const game = games[gameId];
      const expectedTotal = this.getExpectedTotal(gameId);
      game.totalCards = expectedTotal;
      game.isComplete = game.fragments.length === expectedTotal;
    }

    return games;
  }

  private getExpectedTotal(gameId: string): number {
    const gameInfo = this.manifest?.games.find(g => g.gameId === gameId);
    return gameInfo?.totalCards ?? 5; 
  }
}
