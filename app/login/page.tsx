"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { login } from "./actions";
import { useMantineColorScheme } from "@mantine/core";
import "../globals.css";
import Link from "next/link";
import { anonymousSignIn } from "../anon/actions";
import Spinner from "../components/Spinner";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const textColor = colorScheme === "dark" ? "text-black" : "text-black";
  const bgColor = colorScheme === "dark" ? "bg-white" : "bg-gray-300";
  const inputTextColor =
    colorScheme === "dark" ? "text-realGreen" : "text-black";

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.log("Error fetching user", error);
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center font-bold text-2xl text-pink-500 justify-center h-dvh">
        Loading...
      </div>
    );
  }

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <div className="flex flex-col items-center justify-center h-dvh">
        <div className="z-10 hover:text-realGreen transition-all duration-200">
          <Link href={"/"}>FRIQUENCY RADIO</Link>
        </div>
        <form
          className={`relative ${bgColor} p-4 rounded-lg shadow-lg w-96 flex flex-col items-center`}
        >
          <div className="w-full flex flex-col items-center">
            <h1
              className={`text-center [word-spacing:-3px] tracking-tight text-realGreen font-bold text-3xl`}
            >
              Login
            </h1>
            <label htmlFor="email" className={`block ${textColor}`}>
              email:
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`block w-full px-4 py-2 border-2 border-gray-300 font-bold rounded-md ${inputTextColor}`}
              />
            </label>
            <label htmlFor="password" className={`block ${textColor}`}>
              password:
              <input
                id="password"
                name="password"
                type="password"
                required
                className={`block w-full px-4 py-2 border-2 border-gray-300 font-bold rounded-md ${inputTextColor}`}
              />
            </label>
            <button
              className="bg-realGreen text-center mt-2 text-sm [word-spacing:-3px] text-white font-bold py-2 px-4 rounded border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300"
              type="submit"
              formAction={login}
            >
              login
            </button>
          </div>
          <div className="mt-4 flex flex-row items-center text-sm">
            <Link
              href="/signup"
              className="bg-realGreen w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300"
            >
              signup
            </Link>
            <button
              onClick={async (event) => {
                event.preventDefault();
                try {
                  await anonymousSignIn();
                  router.push("/");
                  window.location.reload();
                } catch (error) {
                  console.error("Error during anonymous sign-in", error);
                }
              }}
              className="bg-realGreen w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-pink-500 hover:text-black hover:border-realGreen hover:border-2 transition-all duration-300"
            >
              quick jam
            </button>
          </div>
        </form>
      </div>
    </Suspense>
  );
}
