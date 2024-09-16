"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { signup } from "./actions";
import { useMantineColorScheme } from "@mantine/core";
import "../globals.css";
import Link from "next/link";
import { anonymousSignIn } from "../anon/actions";

export default function SignupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const textColor = colorScheme === "dark" ? "text-black" : "text-black";
  const bgColor = colorScheme === "dark" ? "bg-white" : "bg-gray-300";
  const inputTextColor =
    colorScheme === "dark" ? "text-realOrange" : "text-black";

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
      <div className="flex flex-col items-center justify-center h-dvh">
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
      <div className="z-10 hover:text-realOrange transition-all duration-200">
        <Link href={"/"}>FRIQUENCY RADIO</Link>
      </div>
      <form
        className={`relative ${bgColor} p-4 rounded-lg shadow-lg w-96 flex flex-col items-center`}
      >
        <div className="w-full flex flex-col items-center">
          <h1
            className={`text-center [word-spacing:-3px] tracking-tight text-realOrange font-bold text-3xl`}
          >
            Sign Up
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
          <label htmlFor="username" className={`block ${textColor}`}>
            username:
            <input
              id="username"
              name="username"
              type="text"
              required
              className={`block w-full px-4 py-2 border-2 border-gray-300 font-bold rounded-md ${inputTextColor}`}
            />
          </label>
          <button
            className="bg-realOrange text-center mt-2 text-sm [word-spacing:-3px] text-white font-bold py-2 px-4 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realOrange hover:border-2 transition-all duration-300"
            type="submit"
            formAction={signup}
          >
            signup
          </button>
        </div>
        <div className="mt-4 flex flex-row items-center text-sm">
          <Link
            href="/login"
            className="bg-realOrange w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realOrange hover:border-2 transition-all duration-300"
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
            className="bg-realOrange w-28 text-center text-xs [word-spacing:-3px] text-white font-bold py-1 px-4 ml-2 mr-2 rounded border-2 border-transparent hover:bg-yellow-500 hover:text-black hover:border-realOrange hover:border-2 transition-all duration-300"
          >
            quick jam
          </button>
        </div>
      </form>
    </div>
  );
}
