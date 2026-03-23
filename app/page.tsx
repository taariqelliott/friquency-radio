import Link from "next/link";
import { fetchUser, handleDeleteAccount, handleLogout } from "./actions";
import { anonymousSignIn } from "./anon/actions";
import DemoClientComponent from "./components/DemoClientComponent";

export default async function Home() {
  const user = await fetchUser();

  if (user) {
    return (
      <main className="app-page app-page-center">
        <div className="app-shell-narrow">
          <div className="app-panel">
            <div className="mb-5 text-center">
              <div className="app-kicker">Dashboard</div>
            </div>

            <div className="relative">
              <DemoClientComponent />
            </div>

            <div className="mt-6 flex justify-center">
              {user.user.is_anonymous ? (
                <form action={handleDeleteAccount}>
                  <button className="app-action-secondary" type="submit">
                    End Session
                  </button>
                </form>
              ) : (
                <form action={handleLogout}>
                  <button className="app-action-secondary" type="submit">
                    Logout
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main className="app-page app-page-center">
      <div className="app-shell-narrow space-y-6 text-center">
        <div className="app-panel">
          <div className="app-kicker mb-3">Public Listening Rooms</div>
          <h1 className="mb-4 text-center text-5xl font-bold tracking-tight">
            Friquency Radio
          </h1>

          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold text-lime-500">
              Drop Tracks, Chat Together
            </h2>
            <p className="app-copy mx-auto max-w-2xl text-lg">
              Create public listening rooms, upload a track to your station,
              and let every listener control playback locally while the room
              stays connected through chat.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="mb-4 flex gap-4">
              <Link
                href="/login"
                className="app-action-secondary w-32 text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="app-action-primary w-32 text-sm"
              >
                Sign Up
              </Link>
            </div>

            <form
              action={async () => {
                "use server";
                try {
                  await anonymousSignIn();
                } catch (error) {
                  console.error("Error during anonymous sign-in.", error);
                }
              }}
            >
              <button className="app-action-secondary w-64 text-sm">
                Try Quick Jam
                <br />
                <span className="app-muted text-xs font-bold">
                  No Sign Up Required
                </span>
              </button>
            </form>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="app-card text-center">
              <h3 className="mb-2 font-bold text-blue-500">Public Rooms</h3>
              <p className="app-copy text-sm">
                Share a station link and let anyone drop in
              </p>
            </div>
            <div className="app-card text-center">
              <h3 className="mb-2 font-bold text-blue-500">Uploaded Audio</h3>
              <p className="app-copy text-sm">
                Room creators can attach their own tracks
              </p>
            </div>
            <div className="app-card text-center">
              <h3 className="mb-2 font-bold text-blue-500">Listener Control</h3>
              <p className="app-copy text-sm">
                Everyone gets their own play, pause, and seek controls
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
