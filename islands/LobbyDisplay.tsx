import { Lobby, User } from "🛠️/types.ts";

export function LobbyDisplay(props: { lobby: Lobby; user: User }) {
  const { lobby, user } = props;
  const isGameAdmin = lobby.players[0].user.id === user.id;

  return (
    <div>
      <h1>Lobby</h1>
      <ul>
        {lobby.players.map((player) => (
          <li>{player.user.name ?? player.user.login}</li>
        ))}
      </ul>
      {isGameAdmin && <AdminDisplay />}
    </div>
  );
}

function AdminDisplay() {
  return (
    <form method="POST">
      <button>Start</button>
    </form>
  );
}
