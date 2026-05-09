export type CardRole = 'HEADER' | 'PAYLOAD' | 'FOOTER';

export interface CardFragment {
  cardId: string;
  gameId: string;
  role: CardRole;
  index: number;
  hash: string;
  filePath: string;
}

export interface GameSet {
  gameId: string;
  gameName: string;
  totalCards: number;
  fragments: CardFragment[];
  isComplete: boolean;
}
