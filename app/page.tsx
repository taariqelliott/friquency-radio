import { handleLogout, handleDeleteAccount, fetchUser } from "./actions";
import DemoClientComponent from "./components/DemoClientComponent";
import Link from "next/link";
import { anonymousSignIn } from "./anon/actions";

export default async function Home() {
  const user = await fetchUser();

  if (user) {
    return (
      <main className="flex flex-col items-center justify-center min-h-dvh p-8 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl w-full space-y-8">
          <div className="bg-black bg-opacity-50 p-6 rounded-lg border-2 border-realGreen shadow-xl">
            <div className="border-2 border-pink-500 rounded-lg p-4">
              <h1 className="text-3xl font-bold text-white mb-6 text-center">
                Dashboard
              </h1>

              <div className="relative">
                <DemoClientComponent />
              </div>

              <div className="mt-6 flex justify-center">
                {user.user.is_anonymous ? (
                  <form action={handleDeleteAccount}>
                    <button
                      className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full border-2 border-transparent hover:bg-realGreen hover:text-white hover:border-pink-500 transition-all duration-300"
                      type="submit"
                    >
                      End Session
                    </button>
                  </form>
                ) : (
                  <form action={handleLogout}>
                    <button
                      className="bg-pink-500 text-white font-bold py-3 px-8 rounded-full border-2 border-transparent hover:bg-realGreen hover:text-white hover:border-pink-500 transition-all duration-300"
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
    <main className="flex flex-col items-center justify-center min-h-dvh p-8 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-3xl text-center space-y-6">
        <h1 className="text-5xl font-bold mb-4 pb-3 text-center bg-black border-2 border-x-pink-500 border-y-realGreen rounded-lg p-4 text-white">
          Friquency Radio
        </h1>

        <div className="space-y-4 mb-8">
          <h2 className="text-2xl text-white font-semibold">
            Watch Together, Chat Together
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Your social Twitch companion - Watch your favorite streamers while
            chatting with friends in real-time. Create or join listening rooms
            and experience content together.
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <div className="flex gap-4 mb-4">
            <Link
              href="/login"
              className="bg-realGreen w-32 text-center text-sm text-white font-bold py-2 px-6 rounded-lg border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-realGreen w-32 text-center text-sm text-white font-bold py-2 px-6 rounded-lg border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300"
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
            <button className="bg-pink-500 w-64 text-sm text-white font-bold py-3 px-8 rounded-lg border-2 border-transparent hover:bg-realGreen hover:text-white hover:border-pink-500 hover:border-2 transition-all duration-300">
              Try Quick Jam
              <br />
              <span className="text-xs opacity-75 text-zinc-900 font-bold">
                No Sign Up Required
              </span>
            </button>
          </form>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-12">
          <div className="text-center p-4 bg-black bg-opacity-50 rounded-lg">
            <h3 className="text-realGreen font-bold mb-2">Watch Together</h3>
            <p className="text-gray-300 text-sm">
              Synchronize Twitch streams with friends
            </p>
          </div>
          <div className="text-center p-4 bg-black bg-opacity-50 rounded-lg">
            <h3 className="text-realGreen font-bold mb-2">Real-time Chat</h3>
            <p className="text-gray-300 text-sm">
              Connect with others while watching
            </p>
          </div>
          <div className="text-center p-4 bg-black bg-opacity-50 rounded-lg">
            <h3 className="text-realGreen font-bold mb-2">Easy to Join</h3>
            <p className="text-gray-300 text-sm">Start streaming in seconds</p>
          </div>
        </div>
      </div>
    </main>
  );
}
