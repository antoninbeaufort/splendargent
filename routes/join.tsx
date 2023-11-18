import { Handlers } from "$fresh/server.ts";
import { getGame, getUserByLogin, getUserBySession, setGame } from "🛠️/db.ts";
import { State } from "🛠️/types.ts";
import { initializeGameFrom } from "🛠️/game.ts";

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    if (!ctx.state.session) {
      return new Response("Not logged in", { status: 401 });
    }

    let gameId;
    const formData = await req.formData();
    gameId = formData.get("gameId");

    if (typeof gameId !== "string") {
      const url = new URL(req.url);
      gameId = url.searchParams.get("gameId");
    }

    if (typeof gameId !== "string") {
      return new Response("Missing or invalid gameId", { status: 400 });
    }

    const initiatorUser = await getUserBySession(ctx.state.session);
    if (!initiatorUser) return new Response("Not logged in", { status: 401 });

    const game = await getGame(gameId);
    if (game.status !== "lobby") {
      return new Response("The current game is not in lobby state", {
        status: 400,
      });
    }
    const isPlayerAreadyInGame = game.players.some(
      (player) => player.user.id === initiatorUser.id
    );
    if (!isPlayerAreadyInGame) {
      game.players.push({
        user: initiatorUser,
      });
      await setGame(game);
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: `/game/${game.id}`,
      },
    });
  },
};
