"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { anonymousSignIn } from "../anon/actions";
import { signup } from "./actions";

export default function SignupPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
      <main className="app-page app-page-center">
        <div className="app-panel text-center text-2xl font-bold text-blue-500">
          Loading...
        </div>
      </main>
    );
  }

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <main className="app-page app-page-center">
      <div className="app-shell-narrow">
        <form className="app-panel mx-auto flex w-full max-w-md flex-col gap-5">
          <div className="space-y-2 text-center">
            <Link
              href={"/"}
              className="app-kicker inline-block hover:text-blue-500"
            >
              Friquency Radio
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">Sign Up</h1>
            <p className="app-copy text-sm">
              Set up a profile to launch stations and keep your username.
            </p>
          </div>

          <div className="space-y-4">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="app-input"
            />
            <label htmlFor="username" className="block text-sm font-medium">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="app-input"
            />
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="app-input"
            />
          </div>

          <button
            className="app-action-primary w-full"
            type="submit"
            formAction={signup}
          >
            Sign Up
          </button>

          <div className="flex flex-col items-center gap-3 pt-1 text-sm md:flex-row md:justify-center">
            <Link href="/login" className="app-action-secondary w-full md:w-32">
              Login
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
              className="app-action-secondary w-full md:w-32"
            >
              Quick Jam
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
