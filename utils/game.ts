import { prepareCards } from "./cards.ts";
import { cards } from "./cards.ts";
import { prepareNobles } from "./nobles.ts";
import {
  AllowedNumberOfPlayers,
  Game,
  GemStone,
  SplendorGame,
  User,
} from "./types.ts";

// 2-3-4 players

// 10 nobles (n players + 1 selected by game)
// 7 tokens (expect gold which is always 5), specific conditions when we play at 2/3 players

const numberOfTokensByPlayersMap: Record<AllowedNumberOfPlayers, number> = {
  [2]: 4,
  [3]: 5,
  [4]: 7,
};
// 3 levels of cards : O(40); OO(30); OOO(20)
// 4 card of each level shown (until there is no enough)

// player turn: 1 action between : pick - buy - reserve

// pick:
// 3 tokens with different color
// min 4 tokenson stack to pick 2 of same color
// a player cannot have more than 10 tokens at the end of his round he need to give away some token to be max 10

// at the end of each player turn check for noble auto distribution and end condition
// end condition: the first player with 15 points or more end the game (we complete the tour until be just before the player that has started the game), then we count the points the ranking is done

const symbolColorMap = new Map([
  [GemStone.EMERALD, "#0d9344"],
  [GemStone.DIAMOND, "#f2f3f4"],
  [GemStone.SAPPHIRE, "#035cac"],
  [GemStone.ONYX, "#3e3e3f"],
  [GemStone.RUBY, "#ee3e35"],
  // [GemStone.GOLD, "#fff101"],
]);

export const prepareTokens = (
  numberOfPlayers: AllowedNumberOfPlayers
): Record<GemStone, number> => {
  const gemStones = Object.keys(GemStone) as GemStone[];
  const entries = gemStones.map(
    (key) =>
      [key, numberOfTokensByPlayersMap[numberOfPlayers]] as [GemStone, number]
  );

  return Object.fromEntries(entries) as Record<GemStone, number>;
};

export const initializeGameFrom = (users: User[]): SplendorGame => {
  const numberOfPlayers = users.length as AllowedNumberOfPlayers;

  const decks = prepareCards(cards);
  const nobles = prepareNobles(numberOfPlayers);
  const tokens = prepareTokens(numberOfPlayers);

  return {
    id: crypto.randomUUID(),
    players: [], // Player[],
    visibleCards: new Map([]), // Map<Card["level"], Card[]>,
    nobles,
    tokens,
  };
};

export interface GameStateInProgress {
  state: "in_progress";
  turn: string;
}

export interface GameStateTie {
  state: "tie";
}

export interface GameStateWin {
  state: "win";
  winner: string;
}

export type GameState = GameStateInProgress | GameStateTie | GameStateWin;

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

// GameGrid is a 9-element array of user id strings or nulls
export function analyzeGame(game: Game): GameState {
  const { grid, initiator: initiatorUser, opponent: opponentUser } = game;

  // Determine whose turn it is next
  let initiator = 0;
  let opponent = 0;
  for (const cell of grid) {
    if (cell === initiatorUser.id) {
      initiator++;
    } else if (cell === opponentUser.id) {
      opponent++;
    }
  }
  const turn = initiator > opponent ? opponentUser.id : initiatorUser.id;

  // Check for a win, or a tie situation. Ties can occur when all cells are
  // filled, or when all winning lines contain a mix of both players' ids.
  let allFilled = true;
  let allMixed = true;
  for (const [a, b, c] of WIN_LINES) {
    const cells = new Set([grid[a], grid[b], grid[c]]);
    if (cells.size === 1 && cells.has(initiatorUser.id)) {
      return { state: "win", winner: initiatorUser.id };
    }
    if (cells.size === 1 && cells.has(opponentUser.id)) {
      return { state: "win", winner: opponentUser.id };
    }
    if (cells.has(null)) {
      allFilled = false;
    }
    cells.delete(null);
    if (cells.size !== 2) {
      allMixed = false;
    }
  }
  if (allFilled || allMixed) {
    return { state: "tie" };
  }
  return { state: "in_progress", turn };
}
