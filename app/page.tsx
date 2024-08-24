"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { logout } from "./logout/actions";
import { deleteAccount } from "./delete/actions";
import DemoClientComponent from "./components/DemoClientComponent";
import Link from "next/link";
import { anonymousSignIn } from "./anon/actions";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await logout();
      router.push("/");
      window.location.reload(); // Refresh the page to rerender
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleDeleteAccount = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (user) {
      try {
        await deleteAccount(user.id);
        router.push("/");
        window.location.reload(); // Refresh the page to rerender
      } catch (error) {
        console.error("Error deleting account:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <main className="flex flex-col items-center justify-center h-dvh p-24">
        <DemoClientComponent />
        {user.is_anonymous ? (
          <form onSubmit={handleDeleteAccount}>
            <button
              className="bg-red-500 text-white hover:bg-red-700 font-bold py-2 px-4 rounded"
              type="submit"
            >
              Logout{" "}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogout}>
            <button
              className="bg-realOrange text-white hover:bg-yellow-500 hover:text-black font-bold py-2 px-4 rounded"
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
      <h1 className="text-4xl font-bold mb-8">Friquency Radio 📡</h1>
      <div className="">
        <Link
          href="/login"
          // className="text-blue-500 hover:underline ml-2 mr-2 border p-2 rounded-lg border-2"
          className="bg-realOrange w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realOrange hover:border-2 transition-all duration-300"
        >
          login
        </Link>
        <Link
          href="/signup"
          // className="text-blue-500 hover:underline ml-2 mr-2 border p-2 rounded-lg border-2"
          className="bg-realOrange w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realOrange hover:border-2 transition-all duration-300"
        >
          signup
        </Link>
        <button
          onClick={async () => {
            try {
              await anonymousSignIn();
              router.push("/");
              window.location.reload();
            } catch (error) {
              console.error("Error during anonymous sign-in", error);
            }
          }}
          // className="text-blue-500 hover:underline ml-2 mr-2 border p-2 rounded-lg border-2"
          className="bg-realOrange w-28  text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realOrange hover:border-2 transition-all duration-300"
        >
          quick jam
        </button>
      </div>
    </main>
  );
}
