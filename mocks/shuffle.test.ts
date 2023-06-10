import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import shuffle from "https://deno.land/x/shuffle@v1.0.1/mod.ts";

Deno.test("shuffle stub returns is equal to input", () => {
  // Given
  const test = [1, 2, 3];

  // When
  const shuffledTest = shuffle(test);

  // Then
  assertEquals(shuffledTest, [1, 2, 3]);
});
