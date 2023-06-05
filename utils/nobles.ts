import shuffle from "https://deno.land/x/shuffle@v1.0.1/mod.ts";
import { GemStone } from "./types.ts";
import type { Noble } from "./types.ts";

const nobles: Noble[] = [
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 4,
      [GemStone.RUBY]: 4,
      [GemStone.ONYX]: 0,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 3,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 3,
      [GemStone.ONYX]: 3,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 4,
      [GemStone.SAPPHIRE]: 4,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 4,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 4,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 4,
      [GemStone.EMERALD]: 4,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 3,
      [GemStone.EMERALD]: 3,
      [GemStone.RUBY]: 3,
      [GemStone.ONYX]: 0,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 3,
      [GemStone.SAPPHIRE]: 3,
      [GemStone.EMERALD]: 3,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 4,
      [GemStone.ONYX]: 4,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 3,
      [GemStone.SAPPHIRE]: 3,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 3,
    },
  },
  {
    points: 3,
    requirements: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 3,
      [GemStone.RUBY]: 3,
      [GemStone.ONYX]: 3,
    },
  },
];

export const prepareNobles = (numberOfPlayers: number): Noble[] => {
  const shuffledNobles = shuffle(nobles);
  const numberOfNoblesToPick = numberOfPlayers + 1;

  return shuffledNobles.slice(0, numberOfNoblesToPick);
};
