import { Handlers } from "$fresh/server.ts";
import { getUserByLogin, getUserBySession, setGame } from "🛠️/db.ts";
import { State } from "🛠️/types.ts";
import { initializeGameFrom } from "🛠️/game.ts";

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    if (!ctx.state.session) {
      return new Response("Not logged in", { status: 401 });
    }

    let opponent;
    const formData = await req.formData();
    opponent = formData.get("opponent");

    if (typeof opponent !== "string") {
      const url = new URL(req.url);
      opponent = url.searchParams.get("opponent");
    }

    if (typeof opponent !== "string") {
      return new Response("Missing or invalid opponent", { status: 400 });
    }

    if (opponent.startsWith("@")) {
      opponent = opponent.slice(1);
    }
    const [initiatorUser, opponentUser] = await Promise.all([
      getUserBySession(ctx.state.session),
      getUserByLogin(opponent),
    ]);
    if (!initiatorUser) return new Response("Not logged in", { status: 401 });
    if (!opponentUser) {
      return new Response(
        "Opponent user has not signed up yet. Ask them to sign in to Splendargent to play against you.",
        { status: 400 }
      );
    }
    if (initiatorUser.id === opponentUser.id) {
      return new Response("Cannot play against yourself", { status: 400 });
    }

    const game = initializeGameFrom([initiatorUser, opponentUser]);
    await setGame(game);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/game/${game.id}`,
      },
    });
  },
};