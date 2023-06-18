import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.191.0/testing/bdd.ts";
import { action, initializeGameFrom, prepareTokens } from "🛠️/game.ts";
import { GemStone, SplendorGame } from "🛠️/types.ts";
import { cards } from "./cards.ts";

const testCases = [
  { numberOfPlayers: 2, expectedNumberOfTokens: 4 },
  { numberOfPlayers: 3, expectedNumberOfTokens: 5 },
  { numberOfPlayers: 4, expectedNumberOfTokens: 7 },
] as const;
testCases.map(({ numberOfPlayers, expectedNumberOfTokens }) => {
  Deno.test(
    `should return ${expectedNumberOfTokens} tokens when there is ${numberOfPlayers} players`,
    () => {
      // Given-When
      const tokens = prepareTokens(numberOfPlayers);

      // Then
      assertEquals(tokens[GemStone.EMERALD], expectedNumberOfTokens);
      assertEquals(tokens[GemStone.DIAMOND], expectedNumberOfTokens);
      assertEquals(tokens[GemStone.SAPPHIRE], expectedNumberOfTokens);
      assertEquals(tokens[GemStone.ONYX], expectedNumberOfTokens);
      assertEquals(tokens[GemStone.RUBY], expectedNumberOfTokens);
    },
  );
});

describe("pick when it's your turn", () => {
  let game: SplendorGame;
  beforeEach(() => {
    game = initializeGameFrom([
      {
        id: "1",
        login: "player1",
        name: "Player 1",
        avatarUrl: "http://localhost/avatars/player1.png",
      },
      {
        id: "2",
        login: "player2",
        name: "Player 2",
        avatarUrl: "http://localhost/avatars/player2.png",
      },
      {
        id: "3",
        login: "player3",
        name: "Player 3",
        avatarUrl: "http://localhost/avatars/player3.png",
      },
      {
        id: "4",
        login: "player4",
        name: "Player 4",
        avatarUrl: "http://localhost/avatars/player4.png",
      },
    ]);
  });

  it("should allow player to pick different tokens", () => {
    // When
    const updatedGame = action(game, {
      type: "pick",
      tokens: [GemStone.EMERALD, GemStone.DIAMOND, GemStone.SAPPHIRE],
    });

    // Then
    assertEquals(updatedGame.players[0].tokens[GemStone.EMERALD], 1);
    assertEquals(updatedGame.players[0].tokens[GemStone.DIAMOND], 1);
    assertEquals(updatedGame.players[0].tokens[GemStone.SAPPHIRE], 1);
    assertEquals(updatedGame.tokens[GemStone.EMERALD], 6);
    assertEquals(updatedGame.tokens[GemStone.DIAMOND], 6);
    assertEquals(updatedGame.tokens[GemStone.SAPPHIRE], 6);
  });

  it("should allow player to pick 2 tokens of same gemstone", () => {
    // When
    const updatedGame = action(game, {
      type: "pick",
      tokens: [GemStone.DIAMOND, GemStone.DIAMOND],
    });

    // Then
    assertEquals(updatedGame.players[0].tokens[GemStone.DIAMOND], 2);
    assertEquals(updatedGame.tokens[GemStone.DIAMOND], 5);
  });

  it("should not be able to pick more than 3 tokens", () => {
    // When
    const pick = () =>
      action(game, {
        type: "pick",
        tokens: [
          GemStone.DIAMOND,
          GemStone.EMERALD,
          GemStone.ONYX,
          GemStone.RUBY,
        ],
      });

    // Then
    assertThrows(pick);
  });

  it("should not be able to pick 3 tokens of same gemstone", () => {
    // When
    const pick = () =>
      action(game, {
        type: "pick",
        tokens: [
          GemStone.DIAMOND,
          GemStone.DIAMOND,
          GemStone.DIAMOND,
        ],
      });

    // Then
    assertThrows(pick);
  });

  it("should not be able to pick 2 tokens of same gemstone and token(s) of another gemstone", () => {
    // When
    const pick = () =>
      action(game, {
        type: "pick",
        tokens: [
          GemStone.DIAMOND,
          GemStone.DIAMOND,
          GemStone.EMERALD,
        ],
      });

    // Then
    assertThrows(pick);
  });

  it("should not be able to pick 2 tokens of same gemstone if there is less than 4 tokens of this gemstone remaining", () => {
    // Given
    const gameCopy = structuredClone(game);
    gameCopy.tokens[GemStone.DIAMOND] = 3;

    // When
    const pick = () =>
      action(gameCopy, {
        type: "pick",
        tokens: [
          GemStone.DIAMOND,
          GemStone.DIAMOND,
        ],
      });

    // Then
    assertThrows(pick);
  });

  it("should not be able to pick a token of a specific gemstone if there is no remaining token of this gemstone", () => {
    // Given
    const gameCopy = structuredClone(game);
    gameCopy.tokens[GemStone.DIAMOND] = 0;

    // When
    const pick = () =>
      action(gameCopy, {
        type: "pick",
        tokens: [
          GemStone.DIAMOND,
          GemStone.EMERALD,
          GemStone.RUBY,
        ],
      });

    // Then
    assertThrows(pick);
  });
});

describe("buy when it's your turn", () => {
  let game: SplendorGame;
  beforeEach(() => {
    game = initializeGameFrom([
      {
        id: "1",
        login: "player1",
        name: "Player 1",
        avatarUrl: "http://localhost/avatars/player1.png",
      },
      {
        id: "2",
        login: "player2",
        name: "Player 2",
        avatarUrl: "http://localhost/avatars/player2.png",
      },
      {
        id: "3",
        login: "player3",
        name: "Player 3",
        avatarUrl: "http://localhost/avatars/player3.png",
      },
      {
        id: "4",
        login: "player4",
        name: "Player 4",
        avatarUrl: "http://localhost/avatars/player4.png",
      },
    ]);
    game.players[0].tokens = {
      [GemStone.DIAMOND]: 1,
      [GemStone.SAPPHIRE]: 1,
      [GemStone.EMERALD]: 1,
      [GemStone.RUBY]: 1,
      [GemStone.ONYX]: 1,
    };
    game.tokens = {
      [GemStone.DIAMOND]: 6,
      [GemStone.SAPPHIRE]: 6,
      [GemStone.EMERALD]: 6,
      [GemStone.RUBY]: 6,
      [GemStone.ONYX]: 6,
    };
  });

  it("should not allow player to pick a card that is not visible", () => {
    // When
    const buy = () =>
      action(game, {
        type: "buy",
        card: cards[4],
      });

    // Then
    assertThrows(buy);
  });

  it("should not allow player to pick a card when he have not enough tokens", () => {
    // When
    const buy = () =>
      action(game, {
        type: "buy",
        card: cards[71],
      });

    // Then
    assertThrows(buy);
  });

  it("should allow player to buy a card if he have enough tokens", () => {
    // When
    const updatedGame = action(game, {
      type: "buy",
      card: game.visibleCards.get(1)![0]!,
    });

    // Then
    assertEquals(updatedGame.players[0].cards, [cards[0]]);
    assertEquals(updatedGame.players[0].tokens[GemStone.DIAMOND], 0);
    assertEquals(updatedGame.players[0].tokens[GemStone.SAPPHIRE], 0);
    assertEquals(updatedGame.players[0].tokens[GemStone.EMERALD], 0);
    assertEquals(updatedGame.players[0].tokens[GemStone.RUBY], 0);
    assertEquals(updatedGame.players[0].tokens[GemStone.ONYX], 1);
    assertEquals(updatedGame.tokens[GemStone.DIAMOND], 7);
    assertEquals(updatedGame.tokens[GemStone.SAPPHIRE], 7);
    assertEquals(updatedGame.tokens[GemStone.EMERALD], 7);
    assertEquals(updatedGame.tokens[GemStone.RUBY], 7);
    assertEquals(updatedGame.tokens[GemStone.ONYX], 6);
    assertEquals(updatedGame.visibleCards.get(1)![0], cards[4]);
  });
});
