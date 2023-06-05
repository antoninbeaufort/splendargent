import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { prepareNobles } from "./nobles.ts";

const testCases = [
  { numberOfPlayers: 2, expectedNumberOfNobles: 3 },
  { numberOfPlayers: 3, expectedNumberOfNobles: 4 },
  { numberOfPlayers: 4, expectedNumberOfNobles: 5 },
];
testCases.map(({ numberOfPlayers, expectedNumberOfNobles }) => {
  Deno.test(
    `should return ${expectedNumberOfNobles} nobles when there is ${numberOfPlayers} players`,
    () => {
      // Given-When
      const nobles = prepareNobles(numberOfPlayers);

      // Then
      assertEquals(nobles.length, expectedNumberOfNobles);
    }
  );
});
