import { HandlerContext, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

import { State, User } from "🛠️/types.ts";
import { getUserBySession } from "🛠️/db.ts";

import { Button, ButtonLink } from "🧱/Button.tsx";
import { Header } from "🧱/Header.tsx";

type Data = SignedInData | null;

interface SignedInData {
  user: User;
}

export async function handler(req: Request, ctx: HandlerContext<Data, State>) {
  if (!ctx.state.session) return ctx.render(null);

  const user = await getUserBySession(ctx.state.session);
  if (!user) return ctx.render(null);

  return ctx.render({ user });
}

export default function Home(props: PageProps<Data>) {
  return (
    <>
      <Head>
        <title>Splendargent</title>
      </Head>
      <div class="px-4 py-8 mx-auto max-w-screen-md">
        <Header user={props.data?.user ?? null} />
        {props.data ? <SignedIn /> : <SignedOut />}
      </div>
    </>
  );
}

function SignedIn() {
  return (
    <>
      <form action="/start" method="POST">
        <input
          type="text"
          name="opponent"
          placeholder="@monalisa"
          class="w-full px-4 py-2 border border-gray-300 rounded-md flex-1"
          required
        />
        <Button type="submit" class="mt-4">
          Join Game
        </Button>
      </form>
      <form action="/create" method="POST">
        <Button type="submit" class="mt-4">
          Create Game
        </Button>
      </form>
    </>
  );
}

function SignedOut() {
  return (
    <>
      <p class="my-6">
        Welcome to the Splendargent game! You can log in with your GitHub
        account below to challenge others to a game of Splendargent.
      </p>
      <p class="my-6">
        <ButtonLink href="/auth/signin">Log in with GitHub</ButtonLink>
      </p>
    </>
  );
}
