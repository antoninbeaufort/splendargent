import { useEffect, useState } from "preact/hooks";
import { tw } from "twind";

import { Game, SplendorGame, User } from "🛠️/types.ts";
import { analyzeGame, GameState } from "🛠️/game.ts";
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

      <div class="grid grid-cols-3 max-w-md mx-auto">
        {JSON.stringify(game, null, 2)}
      </div>
    </>
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
