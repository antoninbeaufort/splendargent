import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { separateCards } from "🛠️/cards.ts";
import type { Card } from "🛠️/types.ts";
import { GemStone } from "🛠️/types.ts";

Deno.test("should separate cards by level", () => {
  // Given
  const cards: Card[] = [
    {
      symbol: GemStone.DIAMOND,
      points: 0,
      level: 1,
      price: {
        [GemStone.DIAMOND]: 0,
        [GemStone.SAPPHIRE]: 1,
        [GemStone.EMERALD]: 1,
        [GemStone.RUBY]: 1,
        [GemStone.ONYX]: 1,
      },
    },
    {
      symbol: GemStone.EMERALD,
      points: 1,
      level: 2,
      price: {
        [GemStone.DIAMOND]: 3,
        [GemStone.SAPPHIRE]: 0,
        [GemStone.EMERALD]: 2,
        [GemStone.RUBY]: 3,
        [GemStone.ONYX]: 0,
      },
    },
    {
      symbol: GemStone.RUBY,
      points: 5,
      level: 3,
      price: {
        [GemStone.DIAMOND]: 0,
        [GemStone.SAPPHIRE]: 0,
        [GemStone.EMERALD]: 7,
        [GemStone.RUBY]: 3,
        [GemStone.ONYX]: 0,
      },
    },
  ];

  // When
  const separatedCards = separateCards(cards);

  // Then
  assertEquals(separatedCards[1], [
    {
      symbol: GemStone.DIAMOND,
      points: 0,
      level: 1,
      price: {
        [GemStone.DIAMOND]: 0,
        [GemStone.SAPPHIRE]: 1,
        [GemStone.EMERALD]: 1,
        [GemStone.RUBY]: 1,
        [GemStone.ONYX]: 1,
      },
    },
  ]);
  assertEquals(separatedCards[2], [
    {
      symbol: GemStone.EMERALD,
      points: 1,
      level: 2,
      price: {
        [GemStone.DIAMOND]: 3,
        [GemStone.SAPPHIRE]: 0,
        [GemStone.EMERALD]: 2,
        [GemStone.RUBY]: 3,
        [GemStone.ONYX]: 0,
      },
    },
  ]);
  assertEquals(separatedCards[3], [
    {
      symbol: GemStone.RUBY,
      points: 5,
      level: 3,
      price: {
        [GemStone.DIAMOND]: 0,
        [GemStone.SAPPHIRE]: 0,
        [GemStone.EMERALD]: 7,
        [GemStone.RUBY]: 3,
        [GemStone.ONYX]: 0,
      },
    },
  ]);
});
