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
  string | null,
];

export enum GemStone {
  EMERALD = 'EMERALD',
  DIAMOND = 'DIAMOND',
  SAPPHIRE = 'SAPPHIRE',
  ONYX = 'ONYX',
  RUBY = 'RUBY',
  GOLD = 'GOLD',
}



// 2-3-4 players

// 10 nobles (n players + 1 selected by game)
// 7 tokens (expect gold which is 5)
// 3 levels of cards : O(40); OO(30); OOO(20)
// 4 card of each level shown (until there is no enough)
// max 10 tokens by player at the same time
// end condition: the first player with 15 points or more end the game, then we count the points the ranking is done

type Price = Partial<Record<GemStone, number>>;

export type Card = {
  symbol: GemStone;
  points: number;
  level: 1 | 2 | 3;
  price: Price;
}

export interface Game {
  id: string;
  initiator: User;
  opponent: User;
  grid: GameGrid;
  startedAt: Date;
  lastMoveAt: Date;
}
