import { handleLogout, handleDeleteAccount, fetchUser } from "./actions";
import DemoClientComponent from "./components/DemoClientComponent";
import Link from "next/link";
import { anonymousSignIn } from "./anon/actions";

export default async function Home() {
  const user = await fetchUser();

  if (user) {
    return (
      <main className="flex flex-col items-center justify-center h-dvh p-24">
        <DemoClientComponent />
        {user.user.is_anonymous ? (
          <form action={handleDeleteAccount}>
            <button
              className="bg-realGreen text-white hover:bg-green-700 font-bold py-2 px-4 rounded"
              type="submit"
            >
              Logout{" "}
            </button>
          </form>
        ) : (
          <form action={handleLogout}>
            <button
              className="bg-realGreen text-white hover:bg-pink-500 hover:text-black font-bold py-2 px-4 rounded"
              type="submit"
            >
              Logout
            </button>
          </form>
        )}
      </main>
    );
  }
  return (
    <main className="flex flex-col items-center justify-center h-dvh p-24">
      <h1 className="text-4xl font-bold mb-8 text-center text-pink-500">
        Friquency Radio (Demo Test)
      </h1>
      <div className="flex">
        {" "}
        <Link
          href="/login"
          className="bg-realGreen w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300"
        >
          login
        </Link>
        <Link
          href="/signup"
          className="bg-realGreen w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300"
        >
          signup
        </Link>
        <form
          action={async () => {
            "use server";
            try {
              await anonymousSignIn();
            } catch (error) {
              console.error("Error during anonymous sign-in", error);
            }
          }}
        >
          <button className="bg-realGreen w-28 text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300">
            quick jam
          </button>
        </form>
      </div>
    </main>
  );
}
