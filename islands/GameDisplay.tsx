import { useEffect, useState } from "preact/hooks";
import { tw } from "twind";

import { Card, GemStone, Noble, Player, SplendorGame, User } from "🛠️/types.ts";
import { Action, assertPicking, symbolColorMap } from "🛠️/game.ts";
import { useDataSubscription } from "🛠️/hooks.ts";

import { UserNameHorizontal, UserNameVertical } from "🧱/User.tsx";
import { rainbowBackground } from "🧱/animations.ts";

export default function GameDisplay(props: {
  game: SplendorGame;
  user: User | null;
}) {
  const { user } = props;
  const [game, setGame] = useState(props.game);

  useDataSubscription(() => {
    const eventSource = new EventSource(
      `/api/events/game?id=${encodeURIComponent(props.game.id)}`
    );
    eventSource.onmessage = (e) => {
      const newGame = JSON.parse(e.data) as SplendorGame;
      setGame(newGame);
    };
    return () => eventSource.close();
  }, [props.game.id]);

  // here was the game analysis
  const state = "in_progress";

  const isPlayerTurn = game.turn === user?.id;
  const getPlayerPoints = (player: Player): number => {
    const pointsFromCards = player.cards.reduce((acc, curr) => {
      return acc + curr.points;
    }, 0);
    const pointsFromNobles = player.nobles.reduce((acc, curr) => {
      return acc + curr.points;
    }, 0);

    return pointsFromCards + pointsFromNobles;
  };

  return (
    <>
      <div
        class={tw`border rounded-xl my-6 text-xl sm:text-2xl text-center p-4 ${
          state === "in_progress" && game.turn === user?.id && rainbowBackground
        }`}
      >
        {/* {state === "win" && (
          <>{state.winner === game.initiator.id ? "❌" : "⭕"} wins!</>
        )} */}
        {state === "in_progress" &&
          (isPlayerTurn ? (
            <>Your turn!</>
          ) : (
            <>
              Waiting for{" "}
              <UserNameHorizontal
                user={
                  game.players.find((player) => player.user.id === game.turn)!
                    .user
                }
              />
              ...
            </>
          ))}
        {/* {state === "tie" && <>Tie!</>} */}
      </div>

      <div class="flex gap-x-4">
        <div class="max-w-md mx-auto flex flex-col gap-y-4">
          <Nobles nobles={game.nobles} />
          <VisibleCards visibleCards={game.visibleCards} gameId={game.id} />
          <Tokens
            tokens={game.tokens}
            gameId={game.id}
            isPlayerTurn={isPlayerTurn}
          />
        </div>
        <div class="w-full border rounded-xl overflow-hidden">
          {game.players.map((player) => (
            <div class="border-b p-4">
              <div class={`flex justify-between items-center gap-4`}>
                <img
                  class="w-16 h-16 rounded-full"
                  src={player.user.avatarUrl}
                  alt={player.user.name}
                />
                <UserNameVertical user={player.user} class="w-full" />
              </div>
              <div class="flex">
                <div>
                  <PlayerTokens tokens={player.tokens} />
                  <PlayerCardsPoints cards={player.cards} />
                </div>
                <div class="flex justify-end text-center flex-grow mr-4">
                  <div class="flex items-center">
                    <p class="text-3xl">{getPlayerPoints(player)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function PlayerTokens(props: { tokens: Partial<Record<GemStone, number>> }) {
  const tokensEntries = Object.entries(props.tokens) as [GemStone, number][];

  return (
    <div class="flex mt-2 gap-x-1">
      {tokensEntries.map(([gemStone, count]) => (
        <Price gemStone={gemStone} count={count} hiddenOnNoCount />
      ))}
    </div>
  );
}

function PlayerCardsPoints(props: { cards: Card[] }) {
  const gemStoneOccurences = props.cards.reduce(
    (acc, curr) => {
      const objectKey = acc[curr.symbol];
      acc[curr.symbol] = objectKey + 1;

      return acc;
    },
    {
      [GemStone.DIAMOND]: 0,
      [GemStone.SAPPHIRE]: 0,
      [GemStone.EMERALD]: 0,
      [GemStone.RUBY]: 0,
      [GemStone.ONYX]: 0,
    } as Record<GemStone, number>
  );
  const tokensEntries = Object.entries(gemStoneOccurences) as [
    GemStone,
    number
  ][];

  return (
    <div class="flex mt-2 gap-x-1">
      {tokensEntries.map(([gemStone, count]) => (
        <Price
          gemStone={gemStone}
          count={count}
          rounded="rounded"
          hiddenOnNoCount
        />
      ))}
    </div>
  );
}

function VisibleCards(props: {
  visibleCards: Record<Card["level"], (Card | null)[]>;
  gameId: string;
}) {
  const rows = (
    Object.entries(props.visibleCards) as [string, (Card | null)[]][]
  ).map(([level, cards]) => [parseInt(level, 10), cards]) as [
    number,
    (Card | null)[]
  ][];
  const orderedRows = rows.toSorted(([levelA], [levelB]) => levelB - levelA);

  return (
    <div class="flex flex-col gap-y-8">
      {orderedRows.map(([_level, cards]) => (
        <Row cards={cards} gameId={props.gameId} />
      ))}
    </div>
  );
}

function Row(props: { cards: (Card | null)[]; gameId: string }) {
  return (
    <div class="flex gap-x-2">
      {props.cards.map((card) => (
        <Card card={card} gameId={props.gameId} />
      ))}
    </div>
  );
}

function Card(props: { card: Card | null; gameId: string }) {
  if (!props.card) {
    return <div class="bg-gray-800 w-32 h-48 rounded-lg"></div>;
  }

  const buy = async () => {
    const action: Action = {
      type: "buy",
      card: props.card!,
    };
    const res = await fetch(`/api/action?id=${props.gameId}`, {
      method: "POST",
      body: JSON.stringify(action),
    });
    if (res.status !== 200) {
      alert("Something went wrong");
    }
  };

  return (
    <div
      class={`relative w-32 h-48 rounded-lg flex flex-col p-2 bg-gray-200`}
      onClick={buy}
    >
      <div
        class={`absolute bg-[${symbolColorMap.get(
          props.card.symbol
        )}] inset-x-0 top-0 h-full opacity-40 rounded-lg`}
      ></div>
      <div class="z-10">
        <span class="text-3xl font-extrabold">{props.card.points}</span>
      </div>
      <div class="z-10 flex flex-col justify-end flex-grow gap-y-0.5">
        {(Object.entries(props.card.price) as [GemStone, number][]).map(
          ([gemStone, count]) => (
            <Price gemStone={gemStone} count={count} />
          )
        )}
      </div>
    </div>
  );
}

function Price(props: {
  gemStone: GemStone;
  count: number;
  size?: number;
  rounded?: string;
  onClick?: any;
  hiddenOnNoCount?: boolean;
  isPlayerTurn?: boolean;
}) {
  const sizeOrDefault = props.size ?? 6;
  const roundedOrDefault = props.rounded ?? "rounded-full";

  if (!props.count && !props.hiddenOnNoCount) return null;

  return (
    <button
      class={`block text-center w-${sizeOrDefault} h-${sizeOrDefault} px-${
        sizeOrDefault / 3
      } ${roundedOrDefault} font-bold ${
        props.gemStone === GemStone.DIAMOND ? "" : "text-white"
      } ${!props.count ? "opacity-30" : ""} ${
        !props.isPlayerTurn ? "cursor-default" : ""
      }`}
      style={{ backgroundColor: symbolColorMap.get(props.gemStone) }}
      disabled={!props.count || !props.isPlayerTurn}
      onClick={props.onClick}
    >
      {props.count}
    </button>
  );
}

function Nobles(props: { nobles: Noble[] }) {
  return (
    <div class="flex gap-x-2">
      {props.nobles.map((noble) => (
        <NobleCard noble={noble} />
      ))}
    </div>
  );
}

function NobleCard(props: { noble: Noble }) {
  return (
    <div class={`bg-gray-200 rounded-lg w-40 h-40 p-2 flex flex-col`}>
      <span class="ml-2 text-3xl font-extrabold">{props.noble.points}</span>
      <div class="flex flex-col flex-grow gap-y-0.5 justify-end">
        {(Object.entries(props.noble.requirements) as [GemStone, number][]).map(
          ([gemStone, count]) => (
            <Price gemStone={gemStone} count={count} rounded="rounded" />
          )
        )}
      </div>
    </div>
  );
}

function Tokens(props: {
  tokens: Record<GemStone, number>;
  gameId: string;
  isPlayerTurn: boolean;
}) {
  const getTokensMinusSelectedOnes = (): Record<GemStone, number> => {
    return {
      [GemStone.EMERALD]:
        props.tokens[GemStone.EMERALD] - selectedTokens[GemStone.EMERALD],
      [GemStone.DIAMOND]:
        props.tokens[GemStone.DIAMOND] - selectedTokens[GemStone.DIAMOND],
      [GemStone.SAPPHIRE]:
        props.tokens[GemStone.SAPPHIRE] - selectedTokens[GemStone.SAPPHIRE],
      [GemStone.ONYX]:
        props.tokens[GemStone.ONYX] - selectedTokens[GemStone.ONYX],
      [GemStone.RUBY]:
        props.tokens[GemStone.RUBY] - selectedTokens[GemStone.RUBY],
    };
  };

  useEffect(() => {
    setCurrentTokens(getTokensMinusSelectedOnes());
  });

  const getInitialSelectedTokens = () => {
    return Object.fromEntries(
      (Object.entries(props.tokens) as [GemStone, number][]).map(
        ([gemStone]) => [gemStone, 0]
      )
    ) as Record<GemStone, number>;
  };

  const [selectedTokens, setSelectedTokens] = useState<
    Record<GemStone, number>
  >(getInitialSelectedTokens());

  const [currentTokens, setCurrentTokens] = useState<Record<GemStone, number>>({
    ...props.tokens,
  });

  const buildSelectedTokensArray = () => {
    const result: GemStone[] = [];
    for (const [gemStone, count] of Object.entries(selectedTokens) as [
      GemStone,
      number
    ][]) {
      for (const _ of Array(count).keys()) {
        result.push(gemStone);
      }
    }

    return result;
  };

  const selectToken = (gemStone: GemStone) => {
    try {
      assertPicking(props.tokens, [...buildSelectedTokensArray(), gemStone]);
    } catch (error) {
      alert(error.message);
      return;
    }

    setSelectedTokens({
      ...selectedTokens,
      [gemStone]: selectedTokens[gemStone] + 1,
    });
    setCurrentTokens({
      ...currentTokens,
      [gemStone]: currentTokens[gemStone] - 1,
    });
  };
  const removeToken = (gemStone: GemStone) => {
    if (!selectedTokens) {
      return;
    }

    setSelectedTokens({
      ...selectedTokens,
      [gemStone]: selectedTokens[gemStone] - 1,
    });
    setCurrentTokens({
      ...currentTokens,
      [gemStone]: currentTokens[gemStone] + 1,
    });
  };

  const pick = async () => {
    const action: Action = {
      type: "pick",
      tokens: buildSelectedTokensArray(),
    };
    const res = await fetch(`/api/action?id=${props.gameId}`, {
      method: "POST",
      body: JSON.stringify(action),
    });
    if (res.status !== 200) {
      alert("Something went wrong");
      return;
    }

    setSelectedTokens(getInitialSelectedTokens());
  };

  return (
    <div>
      <div class="flex gap-x-2 justify-center">
        {(Object.entries(currentTokens) as [GemStone, number][]).map(
          ([gemStone, count]) => (
            <div>
              <Price
                gemStone={gemStone}
                count={count}
                size={12}
                onClick={() => selectToken(gemStone)}
                hiddenOnNoCount
                isPlayerTurn={props.isPlayerTurn}
              />
              <div class="mt-2">
                <button
                  class={`block text-center mx-auto bg-gray-200 rounded-full w-8 h-8 ${
                    !props.isPlayerTurn ? "cursor-default" : ""
                  } ${!selectedTokens[gemStone] ? "invisible" : ""}`}
                  disabled={!props.isPlayerTurn}
                  onClick={() => removeToken(gemStone)}
                >
                  {selectedTokens[gemStone]}
                </button>
              </div>
            </div>
          )
        )}
      </div>
      {props.isPlayerTurn ? (
        <div class="flex justify-center mt-2">
          <button class="bg-gray-100 p-2 rounded-lg" onClick={pick}>
            Pick
          </button>
        </div>
      ) : null}
    </div>
  );
}
