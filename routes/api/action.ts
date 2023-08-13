import { Handlers } from "$fresh/server.ts";
import { getGameWithVersionstamp, getUserBySession, setGame } from "🛠️/db.ts";
import { State } from "🛠️/types.ts";
import { Action, action } from "🛠️/game.ts";

export const handler: Handlers<undefined, State> = {
  async POST(req, ctx) {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    if (!id) {
      return new Response("Missing id", {
        status: 400,
      });
    }

    const [gameRes, user] = await Promise.all([
      getGameWithVersionstamp(id),
      getUserBySession(ctx.state.session ?? ""),
    ]);
    if (!gameRes) {
      return new Response("Game not found", {
        status: 404,
      });
    }
    const [game, gameVersionstamp] = gameRes;
    if (!user) {
      return new Response("Not signed in", {
        status: 401,
      });
    }

    if (game.turn !== user.id) {
      return new Response("Not your turn", {
        status: 403,
      });
    }

    const actionFromPayload = (await req.json()) as Action;
    const updatedGame = action(game, actionFromPayload);

    const success = await setGame(updatedGame, gameVersionstamp);
    if (!success) {
      return new Response("Game has been updated/deleted while processing", {
        status: 409,
      });
    }
    return new Response(JSON.stringify(updatedGame), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};
