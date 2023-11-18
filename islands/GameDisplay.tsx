import { match } from "npm:ts-pattern";
import { useState } from "preact/hooks";

import { SplendorGame, User } from "🛠️/types.ts";
import { useDataSubscription } from "🛠️/hooks.ts";
import { InGame } from "🏝️/InGame.tsx";
import { LobbyDisplay } from "🏝️/LobbyDisplay.tsx";

export default function GameDisplay(props: { game: SplendorGame; user: User }) {
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

  return match(game)
    .with({ status: "lobby" }, (lobby) => (
      <LobbyDisplay lobby={lobby} user={user} />
    ))
    .with({ status: "in_game" }, (runningGame) => (
      <InGame game={runningGame} user={user} />
    ))
    .exhaustive();
}
