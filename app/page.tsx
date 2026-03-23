import Link from "next/link";
import { fetchUser, handleDeleteAccount, handleLogout } from "./actions";
import { anonymousSignIn } from "./anon/actions";
import DemoClientComponent from "./components/DemoClientComponent";

const pageShellStyle = {
  backgroundColor: "var(--mantine-color-body)",
  color: "var(--mantine-color-text)",
};

const panelStyle = {
  backgroundColor: "var(--mantine-color-default)",
  borderColor: "var(--mantine-color-blue-6)",
};

const innerPanelStyle = {
  backgroundColor: "var(--mantine-color-body)",
  borderColor: "var(--mantine-color-default-border)",
};

export default async function Home() {
  const user = await fetchUser();

  if (user) {
    return (
      <main
        className="flex min-h-dvh flex-col items-center justify-center p-8"
        style={pageShellStyle}
      >
        <div className="max-w-4xl w-full space-y-8">
          <div
            className="rounded-lg border-2 p-6 shadow-xl"
            style={panelStyle}
          >
            <div className="rounded-lg border p-4" style={innerPanelStyle}>
              <h1 className="mb-6 text-center text-3xl font-bold">
                Dashboard
              </h1>

              <div className="relative">
                <DemoClientComponent />
              </div>

              <div className="mt-6 flex justify-center">
                {user.user.is_anonymous ? (
                  <form action={handleDeleteAccount}>
                    <button
                      className="rounded-lg border border-blue-500 bg-black px-8 py-3 font-bold text-lime-500 transition-all duration-300 hover:bg-lime-500 hover:text-black"
                      type="submit"
                    >
                      End Session
                    </button>
                  </form>
                ) : (
                  <form action={handleLogout}>
                    <button
                      className="rounded-lg border border-blue-500 bg-black px-8 py-3 font-bold text-lime-500 transition-all duration-300 hover:bg-lime-500 hover:text-black"
                      type="submit"
                    >
                      Logout
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }
  return (
    <main
      className="flex min-h-dvh flex-col items-center justify-center p-8"
      style={pageShellStyle}
    >
      <div className="max-w-3xl space-y-6 text-center">
        <div
          className="rounded-lg border-2 p-6 shadow-xl"
          style={panelStyle}
        >
          <h1
            className="mb-4 rounded-lg border p-4 text-center text-5xl font-bold"
            style={innerPanelStyle}
          >
            Friquency Radio
          </h1>

          <div className="mb-8 space-y-4">
            <h2 className="text-2xl font-semibold text-lime-500">
              Drop Tracks, Chat Together
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-stone-400">
              Create public listening rooms, upload a track to your station,
              and let every listener control playback locally while the room
              stays connected through chat.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div className="mb-4 flex gap-4">
              <Link
                href="/login"
                className="w-32 rounded-lg border border-blue-500 bg-black px-6 py-2 text-center text-sm font-bold text-lime-500 transition-all duration-300 hover:bg-lime-500 hover:text-black"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="w-32 rounded-lg border border-blue-500 bg-black px-6 py-2 text-center text-sm font-bold text-lime-500 transition-all duration-300 hover:bg-lime-500 hover:text-black"
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
              <button className="w-64 rounded-lg border border-blue-500 bg-black px-8 py-3 text-sm font-bold text-lime-500 transition-all duration-300 hover:bg-lime-500 hover:text-black">
                Try Quick Jam
                <br />
                <span className="text-xs font-bold text-stone-400">
                  No Sign Up Required
                </span>
              </button>
            </form>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div
              className="rounded-lg border p-4 text-center"
              style={innerPanelStyle}
            >
              <h3 className="mb-2 font-bold text-blue-500">Public Rooms</h3>
              <p className="text-sm text-stone-400">
                Share a station link and let anyone drop in
              </p>
            </div>
            <div
              className="rounded-lg border p-4 text-center"
              style={innerPanelStyle}
            >
              <h3 className="mb-2 font-bold text-blue-500">Uploaded Audio</h3>
              <p className="text-sm text-stone-400">
                Room creators can attach their own tracks
              </p>
            </div>
            <div
              className="rounded-lg border p-4 text-center"
              style={innerPanelStyle}
            >
              <h3 className="mb-2 font-bold text-blue-500">Listener Control</h3>
              <p className="text-sm text-stone-400">
                Everyone gets their own play, pause, and seek controls
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
