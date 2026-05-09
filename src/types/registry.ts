import { GameSet } from './card';

export interface CardRegistry {
  version: string;
  games: Record<string, GameSet>;
}

export interface ManifestEntry {
  cardId: string;
  gameId: string;
  gameName: string;
  role: 'HEADER' | 'PAYLOAD' | 'FOOTER';
  index: number;
  hash: string;
}

export interface GameManifestInfo {
  gameId: string;
  gameName: string;
  totalCards: number;
}

export interface Manifest {
  games: GameManifestInfo[];
  cards: ManifestEntry[];
}
