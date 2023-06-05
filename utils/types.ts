export interface State {
  session: string | undefined;
}

export interface User {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
}

export interface OauthSession {
  state: string;
  codeVerifier: string;
}

export type GameGrid = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null
];

export enum GemStone {
  EMERALD = "EMERALD",
  DIAMOND = "DIAMOND",
  SAPPHIRE = "SAPPHIRE",
  ONYX = "ONYX",
  RUBY = "RUBY",
  // GOLD = "GOLD",
}

type Price = Partial<Record<GemStone, number>>;

export type Card = {
  symbol: GemStone;
  points: number;
  level: 1 | 2 | 3;
  price: Price;
};

export type Noble = {
  points: number;
  requirements: Price;
};

type Player = {
  id: string;
  tokens: Price;
  cards: Card[];
  nobles: Noble[];
};
// reservedCards: Card[];

export type AllowedNumberOfPlayers = 2 | 3 | 4;

export type SplendorGame = {
  id: string;
  players: Player[];
  visibleCards: Map<Card["level"], Card[]>;
  nobles: Noble[];
  tokens: Record<GemStone, number>;
};
// need somewhere with decks: Map<Card["level"], Card[]>;

export interface Game {
  id: string;
  initiator: User;
  opponent: User;
  grid: GameGrid;
  startedAt: Date;
  lastMoveAt: Date;
}
