import { GemStone } from "./types.ts";
import type { Card } from "./types.ts";

const cards: Card[] = [
  {
    symbol: GemStone.ONYX,
    points: 0,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 1,
      [GemStone.SAPPHIRE]: 1,
      [GemStone.EMERALD]: 1,
      [GemStone.RUBY]: 1,
      [GemStone.ONYX]: 0,
    },
  },
  {
    symbol: GemStone.ONYX,
    points: 0,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 1,
      [GemStone.SAPPHIRE]: 2,
      [GemStone.EMERALD]: 1,
      [GemStone.RUBY]: 1,
      [GemStone.ONYX]: 0,
    },
  },
  {
    symbol: GemStone.ONYX,
    points: 0,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 2,
      [GemStone.SAPPHIRE]: 2,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 1,
      [GemStone.ONYX]: 0,
    },
  },
  {
    symbol: GemStone.ONYX,
    points: 0,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 1,
      [GemStone.RUBY]: 3,
      [GemStone.ONYX]: 1,
    },
  },
  {
    symbol: GemStone.ONYX,
    points: 0,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 2,
      [GemStone.RUBY]: 1,
      [GemStone.ONYX]: 0,
    },
  },
  {
    symbol: GemStone.ONYX,
    points: 0,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 2,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 2,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    },
  },
  {
    symbol: GemStone.ONYX,
    points: 0,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 3,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    },
  },
  {
    symbol: GemStone.ONYX,
    points: 1,
    level: 1,
    price: {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 4,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    },
  },
];
