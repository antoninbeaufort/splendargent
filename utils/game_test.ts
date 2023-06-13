import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.191.0/testing/bdd.ts";
import { action, initializeGameFrom, prepareTokens } from "🛠️/game.ts";
import { GemStone, SplendorGame } from "🛠️/types.ts";

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

describe("action available when it's your turn", () => {
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
});
