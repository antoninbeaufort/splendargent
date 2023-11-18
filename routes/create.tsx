import { Handlers } from "$fresh/server.ts";
import { getUserByLogin, getUserBySession, setGame } from "🛠️/db.ts";
import { State } from "🛠️/types.ts";
import { initializeGameFrom, initializeLobbyFrom } from "🛠️/game.ts";

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    if (!ctx.state.session) {
      return new Response("Not logged in", { status: 401 });
    }

    const initiatorUser = await getUserBySession(ctx.state.session);
    if (!initiatorUser) return new Response("Not logged in", { status: 401 });

    const game = initializeLobbyFrom(initiatorUser);
    await setGame(game);

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/game/${game.id}`,
      },
    });
  },
};
