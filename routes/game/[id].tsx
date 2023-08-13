import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { SplendorGame, State, User } from "🛠️/types.ts";
import { getGame, getUserBySession } from "🛠️/db.ts";

import { Header } from "🧱/Header.tsx";
import GameDisplay from "🏝️/GameDisplay.tsx";

interface Data {
  game: SplendorGame;
  user: User | null;
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  const [game, user] = await Promise.all([
    getGame(ctx.params.id),
    getUserBySession(ctx.state.session ?? ""),
  ]);
  if (!game) return ctx.renderNotFound();

  return ctx.render({ game, user });
}

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
