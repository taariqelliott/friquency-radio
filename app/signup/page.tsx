"use client";

import { createClient } from "@/utils/supabase/client";
import { useMantineColorScheme } from "@mantine/core";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { anonymousSignIn } from "../anon/actions";
import "../globals.css";
import { signup } from "./actions";

export default function SignupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const textColor = colorScheme === "dark" ? "text-black" : "text-black";
  const bgColor = colorScheme === "dark" ? "bg-white" : "bg-stone-300";
  const inputTextColor =
    colorScheme === "dark" ? "text-blue-500" : "text-black";

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
      <div className="flex flex-col items-center text-2xl text-blue-500 font-bold justify-center h-dvh">
        Loading...
      </div>
    );
  }

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <div className="z-10 hover:text-blue-500 transition-all duration-200">
        <Link href={"/"}>FRIQUENCY RADIO</Link>
      </div>
      <form
        className={`relative ${bgColor} p-4 rounded-lg shadow-lg w-96 flex flex-col items-center`}
      >
        <div className="w-full flex flex-col items-center">
          <h1
            className={`text-center [word-spacing:-3px] tracking-tight text-blue-500 font-bold text-3xl`}
          >
            sign up
          </h1>
          <label htmlFor="email" className={`block ${textColor}`}>
            Email:
            <input
              id="email"
              name="email"
              type="email"
              required
              className={`block w-full px-4 py-2 border-2 border-stone-300 font-bold rounded-md ${inputTextColor}`}
            />
          </label>
          <label htmlFor="username" className={`block ${textColor}`}>
            Username:
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`block w-full px-4 py-2 border-2 border-stone-300 font-bold rounded-md ${inputTextColor}`}
            />
          </label>
          <label htmlFor="password" className={`block ${textColor}`}>
            Password:
            <input
              id="password"
              name="password"
              type="password"
              required
              className={`block w-full px-4 py-2 border-2 border-stone-300 font-bold rounded-md ${inputTextColor}`}
            />
          </label>
          <button
            className="bg-blue-500 text-center mt-2 text-sm [word-spacing:-3px] text-white font-bold py-2 px-4 rounded border-2 border-transparent hover:bg-blue-600 hover:text-black hover:border-blue-600 hover:border-2 transition-all duration-300"
            type="submit"
            formAction={signup}
          >
            sign up
          </button>
        </div>
        <div className="mt-4 flex flex-row items-center text-sm">
          <Link
            href="/login"
            className="bg-blue-500 w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-blue-600 hover:text-black hover:border-blue-600 hover:border-2 transition-all duration-300"
          >
            login
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
            className="bg-blue-500 w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-blue-600 hover:text-black hover:border-blue-600 hover:border-2 transition-all duration-300"
          >
            quick jam
          </button>
        </div>
      </form>
    </div>
  );
}
