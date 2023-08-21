import shuffle from "https://deno.land/x/shuffle@v1.0.1/mod.ts";
import { equal } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { match } from "npm:ts-pattern";
import { prepareCards } from "🛠️/cards.ts";
import { cards } from "🛠️/cards.ts";
import { prepareNobles } from "🛠️/nobles.ts";
import {
  AllowedNumberOfPlayers,
  Card,
  GemStone,
  Noble,
  Player,
  SplendorGame,
  User,
} from "🛠️/types.ts";

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

// at the end of each player turn check for noble auto distribution and end condition (one distrubtion by player bu turn max)
// end condition: the first player with 15 points or more end the game (we complete the tour until be just before the player that has started the game), then we count the points the ranking is done

export const symbolColorMap = new Map([
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

const isValidNumberOfPlayers = (
  numberOfPlayers: number
): numberOfPlayers is AllowedNumberOfPlayers => {
  return [2, 3, 4].includes(numberOfPlayers);
};

export const initializeGameFrom = (users: User[]): SplendorGame => {
  const numberOfPlayers = users.length;
  if (!isValidNumberOfPlayers(numberOfPlayers)) {
    throw new Error("Unvalid number of players");
  }

  const decks = prepareCards(cards);
  const nobles = prepareNobles(numberOfPlayers);
  const tokens = prepareTokens(numberOfPlayers);
  const visibleCards = {
    1: decks[1].splice(0, 4),
    2: decks[2].splice(0, 4),
    3: decks[3].splice(0, 4),
  };
  const shuffledUsers = shuffle(users);
  const players = shuffledUsers.map((user) => ({
    user,
    tokens: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    },
    cards: [],
    nobles: [],
  }));

  return {
    id: crypto.randomUUID(),
    players,
    visibleCards,
    nobles,
    tokens,
    decks,
    turn: players[0].user.id,
  };
};

export type Action =
  | { type: "pick"; tokens: GemStone[] }
  | {
      type: "reserve";
      card: Card;
    }
  | { type: "buy"; card: Card };

const currentPlayerFrom = (game: SplendorGame): Player => {
  const currentPlayer = game.players.find(
    (player) => player.user.id === game.turn
  );
  if (!currentPlayer) {
    throw new Error("Unable to find current player");
  }

  return currentPlayer;
};

export const assertPicking = (
  gameTokens: Record<GemStone, number>,
  tokens: GemStone[]
) => {
  if (tokens.length > 3) {
    throw new Error("you can't pick more than 3 tokens");
  }
  const gemStoneOccurences = tokens.reduce((acc, curr) => {
    const objectKey = acc[curr];
    if (objectKey) {
      acc[curr] = objectKey + 1;
    } else {
      acc[curr] = 1;
    }
    return acc;
  }, {} as Partial<Record<GemStone, number>>);
  for (const [gemStone, occurences] of Object.entries(gemStoneOccurences) as [
    GemStone,
    number
  ][]) {
    if (gameTokens[gemStone] < occurences) {
      throw new Error(`There are no enough tokens of the gemstone ${gemStone}`);
    }
  }

  const isPickingOneTokenOfDifferentGemStones = Object.entries(
    gemStoneOccurences
  ).every(([_gemStone, occurences]) => occurences === 1);
  if (isPickingOneTokenOfDifferentGemStones) {
    return;
  }

  const isManyGemStoneOfSameType = Object.entries(gemStoneOccurences).some(
    ([_gemStone, occurences]) => occurences === 2
  );
  if (isManyGemStoneOfSameType) {
    const numberOfDifferentGemStones = Object.keys(gemStoneOccurences).length;
    if (numberOfDifferentGemStones > 1) {
      throw new Error(
        "you can't pick multiple gemstone while you're picking two tokens of the same gemstones"
      );
    }

    if (gameTokens[tokens[0]] < 4) {
      throw new Error(
        "there are no enough token of this gemstone to pick 2 of them"
      );
    }

    return;
  }

  throw new Error(
    "impossible state, you should pick either 1 token of max 3 different gemstones or 2 tokens of a single gemstone if there are enough gemstones (4)"
  );
};

// pick:
// 3 tokens with different color
// min 4 tokens on stack to pick 2 of same color
// a player cannot have more than 10 tokens at the end of his round he need to give away some token to be max 10
const pick = (game: SplendorGame, tokens: GemStone[]): SplendorGame => {
  assertPicking(game.tokens, tokens);

  const currentPlayer = currentPlayerFrom(game);

  for (const token of tokens) {
    const playerToken = currentPlayer.tokens[token];
    if (playerToken) {
      currentPlayer.tokens[token] = playerToken + 1;
    } else {
      currentPlayer.tokens[token] = 1;
    }
    game.tokens[token]--;
  }

  return game;
};

const assertCardVisible = (game: SplendorGame, card: Card) => {
  const visibleCards = game.visibleCards[card.level];
  if (!visibleCards) {
    throw new Error("card not visible");
  }
  const isCardVisible = visibleCards.some((visibleCard) =>
    equal(visibleCard, card)
  );

  if (!isCardVisible) {
    throw new Error("card not visible");
  }
};

const playerGemStoneCardOwnedFrom = (
  player: Player,
  gemStone: GemStone
): number => {
  return player.cards.filter((playerCard) => playerCard.symbol === gemStone)
    .length;
};

const assertPlayerHasEnoughGemStone = (player: Player, card: Card) => {
  for (const [gemStone, quantity] of Object.entries(card.price) as [
    GemStone,
    number
  ][]) {
    const playerGemStoneTokenQuantity = player.tokens[gemStone] ?? 0;
    const playerGemStoneCardQuantity = playerGemStoneCardOwnedFrom(
      player,
      gemStone
    );
    const playerGemStoneTotalQuantity =
      playerGemStoneTokenQuantity + playerGemStoneCardQuantity;
    if (playerGemStoneTotalQuantity < quantity) {
      throw new Error(
        `player has not enough ${gemStone}, he has ${playerGemStoneTotalQuantity} while it need ${quantity}`
      );
    }
  }
};

const exchangeTokensForBuyCard = (
  game: SplendorGame,
  player: Player,
  card: Card
) => {
  for (const [gemStone, quantity] of Object.entries(card.price) as [
    GemStone,
    number
  ][]) {
    const playerGemStoneCardOwned = playerGemStoneCardOwnedFrom(
      player,
      gemStone
    );
    const quantityMinusPlayerGemStoneCardOwned =
      quantity - playerGemStoneCardOwned;
    if (quantityMinusPlayerGemStoneCardOwned < 1) {
      continue;
    }
    player.tokens[gemStone]! -= quantityMinusPlayerGemStoneCardOwned;
    game.tokens[gemStone]! += quantityMinusPlayerGemStoneCardOwned;
  }
};

const moveBoughtCard = (game: SplendorGame, player: Player, card: Card) => {
  const visibleCardIndex = game.visibleCards[card.level].findIndex(
    (visibleCard) => equal(visibleCard, card)
  );
  const replacementCard = game.decks[card.level].shift();
  game.visibleCards[card.level][visibleCardIndex] = replacementCard ?? null;
  player.cards.push(card);
};

const buy = (game: SplendorGame, card: Card): SplendorGame => {
  assertCardVisible(game, card);
  const currentPlayer = currentPlayerFrom(game);
  assertPlayerHasEnoughGemStone(currentPlayer, card);

  exchangeTokensForBuyCard(game, currentPlayer, card);
  moveBoughtCard(game, currentPlayer, card);

  return game;
};

const reserve = (game: SplendorGame, card: Card): SplendorGame => {
  return game;
};

const getNextPlayer = (game: SplendorGame): string => {
  const currentPlayerIndex = game.players.findIndex(
    (player) => player.user.id === game.turn
  );
  if (currentPlayerIndex === -1) {
    throw new Error("current player index not found");
  }

  return game.players[(currentPlayerIndex + 1) % game.players.length].user.id;
};

const areRequirementsMet = (noble: Noble, player: Player): boolean => {
  for (const [gemStone, neededCount] of Object.entries(noble.requirements)) {
    const playerCountOfGemstone = player.cards.filter(
      (card) => card.symbol === gemStone
    ).length;
    if (playerCountOfGemstone < neededCount) {
      return false;
    }
  }

  return true;
};

const distributeNoble = (game: SplendorGame): SplendorGame => {
  const currentPlayer = currentPlayerFrom(game);

  const nobleIndexThatCanBeGrabbedByCurrentPlayer = game.nobles.findIndex(
    (noble) => areRequirementsMet(noble, currentPlayer)
  );
  if (nobleIndexThatCanBeGrabbedByCurrentPlayer === -1) {
    return game;
  }
  const [removedNoble] = game.nobles.splice(
    nobleIndexThatCanBeGrabbedByCurrentPlayer,
    1
  );
  currentPlayer.nobles.push(removedNoble);

  return game;
};

export const getPlayerPoints = (player: Player): number => {
  const pointsFromCards = player.cards.reduce((acc, curr) => {
    return acc + curr.points;
  }, 0);
  const pointsFromNobles = player.nobles.reduce((acc, curr) => {
    return acc + curr.points;
  }, 0);

  return pointsFromCards + pointsFromNobles;
};

export type Leaderboard = { player: string; score: number }[];

const generateLeaderboard = (game: SplendorGame): Leaderboard => {
  return game.players
    .map((player) => ({
      player: player.user.id,
      score: getPlayerPoints(player),
    }))
    .sort((a, b) => b.score - a.score);
};

export const action = (game: SplendorGame, action: Action): SplendorGame => {
  const gameCopy = structuredClone(game);

  match(action)
    .with({ type: "pick" }, ({ tokens }) => pick(gameCopy, tokens))
    .with({ type: "buy" }, ({ card }) => buy(gameCopy, card))
    .with({ type: "reserve" }, ({ card }) => reserve(gameCopy, card))
    .exhaustive();

  distributeNoble(gameCopy);

  gameCopy.turn = getNextPlayer(gameCopy);

  return gameCopy;
};

export interface GameStateInProgress {
  state: "in_progress";
}

export interface GameStateEnded {
  state: "ended";
  leaderboard: Leaderboard;
}

export type GameState = GameStateInProgress | GameStateEnded;

export const analyzeGame = (game: SplendorGame): GameState => {
  const isFirstPlayerTurn = game.turn === game.players[0].user.id;
  if (!isFirstPlayerTurn) {
    return {
      state: "in_progress",
    };
  }
  const leaderboard = generateLeaderboard(game);
  const somePlayerHaveEnoughPointsToEndGame = leaderboard[0].score >= 15;
  if (!somePlayerHaveEnoughPointsToEndGame) {
    return {
      state: "in_progress",
    };
  }

  return {
    state: "ended",
    leaderboard,
  };
};
