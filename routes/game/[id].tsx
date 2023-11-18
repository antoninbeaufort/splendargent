import { Handlers, HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { SplendorGame, State, User } from "🛠️/types.ts";
import { getGame, getUserBySession, setGame } from "🛠️/db.ts";

import { Header } from "🧱/Header.tsx";
import GameDisplay from "🏝️/GameDisplay.tsx";
import { ShorthandPropertyAssignment } from "https://deno.land/x/ts_morph@17.0.1/ts_morph.js";
import { initializeGameFrom } from "🛠️/game.ts";

interface Data {
  game: SplendorGame;
  user: User;
}

export const handler: Handlers<Data, State> = {
  async GET(_req: Request, ctx) {
    const [game, user] = await Promise.all([
      getGame(ctx.params.id),
      getUserBySession(ctx.state.session ?? ""),
    ]);
    if (!game) return ctx.renderNotFound();
    if (!user) {
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }
    // TODO: check if user in game if already running

    return ctx.render({ game, user });
  },
  async POST(_req: Request, ctx) {
    const [game, user] = await Promise.all([
      getGame(ctx.params.id),
      getUserBySession(ctx.state.session ?? ""),
    ]);
    if (!game) return ctx.renderNotFound();
    if (!user) {
      return new Response("", {
        status: 307,
        headers: { Location: "/" },
      });
    }
    const isGameRunning = game.status === "in_game";
    if (isGameRunning) {
      return new Response("Game is already running", { status: 409 });
    }
    const isGameAdmin = game.players[0].user.id === user.id;
    if (!isGameAdmin) {
      return new Response("Need to be game admin to start a game", {
        status: 401,
      });
    }
    const startedGame = initializeGameFrom(game);
    await setGame(startedGame);

    return ctx.render({ game: startedGame, user });
  },
};

export default function Home(props: PageProps<Data>) {
  const { game, user } = props.data;
  return (
    <>
      <Head>
        <title>{game.id} | Splendargent</title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <Header user={user} />
        <GameDisplay game={game} user={user} />
      </div>
    </>
  );
}
