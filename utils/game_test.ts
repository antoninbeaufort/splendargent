import { stub } from "https://deno.land/std@0.191.0/testing/mock.ts";
import shuffle from "https://deno.land/x/shuffle@v1.0.1/mod.ts";
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.191.0/testing/bdd.ts";
import { initializeGameFrom, prepareTokens } from "🛠️/game.ts";
import { GemStone, SplendorGame } from "🛠️/types.ts";

// FIXME: this do not work
stub({ shuffle }, "shuffle", (arg) => [...arg]);

Deno.test("shuffle stub returns is equal to input", () => {
  // Given
  const test = [1, 2, 3];

  // When
  const shuffledTest = shuffle(test);

  // Then
  assertEquals(shuffledTest, [1, 2, 3]);
});

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
    ]);
  });

  it("should allow player to pick different tokens", () => {
  });
});
