import { useState } from "preact/hooks";
import { tw } from "twind";

import { Card, Game, GemStone, Noble, SplendorGame, User } from "🛠️/types.ts";
import { Action, GameState, assertPicking, symbolColorMap } from "🛠️/game.ts";
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

  return (
    <>
      <div class="grid sm:grid-cols-2 w-full mt-6 border(t l r) rounded(tl-xl tr-xl) overflow-hidden">
        <div
          class={`flex justify-between items-center gap-4 p-4 border-b sm:border-r`}
        >
          <img
            class="w-16 h-16 rounded-full"
            src={game.players[0].user.avatarUrl}
            alt={game.players[0].user.name}
          />
          <UserNameVertical user={game.players[0].user} class="w-full" />
          <div class="text-2xl mx-2">❌</div>
        </div>
        <div class={tw`flex items-center justify-between gap-4 p-4 border-b`}>
          <div class="text-2xl mx-2">⭕</div>
          <UserNameVertical
            user={game.players[1].user}
            class="text-right w-full"
          />
          <img
            class="w-16 h-16 rounded-full"
            src={game.players[1].user.avatarUrl}
            alt={game.players[1].user.name}
          />
        </div>
      </div>
      <div
        class={tw`border(b l r) rounded(bl-xl br-xl) mb-6 text-xl sm:text-2xl text-center p-4 ${
          state === "in_progress" && game.turn === user?.id && rainbowBackground
        }`}
      >
        {/* {state === "win" && (
          <>{state.winner === game.initiator.id ? "❌" : "⭕"} wins!</>
        )} */}
        {state === "in_progress" &&
          (game.turn === user?.id ? (
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

      <div class="max-w-md mx-auto flex flex-col gap-y-4">
        {JSON.stringify(game.players[0].tokens, null, 2)}
        <Nobles nobles={game.nobles} />
        <VisibleCards visibleCards={game.visibleCards} />
        <Tokens tokens={game.tokens} gameId={game.id} />
      </div>
    </>
  );
}

function VisibleCards(props: {
  visibleCards: Record<Card["level"], (Card | null)[]>;
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
        <Row cards={cards} />
      ))}
    </div>
  );
}

function Row(props: { cards: (Card | null)[] }) {
  return (
    <div class="flex gap-x-2">
      {props.cards.map((card) => (
        <Card card={card} />
      ))}
    </div>
  );
}

function Card(props: { card: Card | null }) {
  if (!props.card) {
    return <div class="bg-gray-800 w-32 h-48 rounded-lg"></div>;
  }
  return (
    <div class="bg-gray-200 w-32 h-48 rounded-lg flex flex-col p-1">
      <div>
        {props.card.points} - {props.card.symbol}
      </div>
      <div class="flex flex-col justify-end flex-grow gap-y-0.5">
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
}) {
  if (!props.count) return null;
  const sizeOrDefault = props.size ?? 6;
  const roundedOrDefault = props.rounded ?? "rounded-full";

  return (
    <div
      class={`text-center w-${sizeOrDefault} h-${sizeOrDefault} px-${
        sizeOrDefault / 3
      } pt-${sizeOrDefault / 2 - 3} ${roundedOrDefault} font-bold ${
        props.gemStone === GemStone.DIAMOND ? "" : "text-white"
      }`}
      style={{ backgroundColor: symbolColorMap.get(props.gemStone) }}
      onClick={props.onClick}
    >
      {props.count}
    </div>
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
      <span class="ml-2 text-3xl font-extrabold ">{props.noble.points}</span>
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

function Tokens(props: { tokens: Record<GemStone, number>; gameId: string }) {
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
              />
              <div class="text-center" onClick={() => removeToken(gemStone)}>
                {selectedTokens[gemStone]}
              </div>
            </div>
          )
        )}
      </div>
      <div class="flex justify-center">
        <button class="bg-gray-100 p-2 rounded-lg" onClick={pick}>
          Pick
        </button>
      </div>
    </div>
  );
}

function GameCell(props: {
  index: number;
  game: Game;
  state: GameState;
  user: User | null;
}) {
  const { game, index, user, state } = props;
  const onClick = async () => {
    if (
      state.state !== "in_progress" ||
      state.turn !== user?.id ||
      game.grid[index] !== null
    ) {
      return;
    }
    const res = await fetch(`/api/place?id=${game.id}&index=${index}`, {
      method: "POST",
    });
    if (res.status !== 200) {
      alert("Something went wrong");
    }
  };

  const value = game.grid[index];
  const display =
    value === null ? "" : value === game.initiator.id ? "❌" : "⭕";

  return (
    <div
      class="w-full border-[1px] box-border text-8xl flex items-center justify-center"
      style="aspect-ratio: 1/1"
      onClick={onClick}
    >
      {display}
    </div>
  );
}
