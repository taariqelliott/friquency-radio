"use client";

import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { anonymousSignIn } from "../anon/actions";
import { login } from "./actions";

export default function LoginPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <span className="font-mono text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (user) {
    router.push("/");
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh gap-4 animate-in fade-in duration-300">
      <Link
        href="/"
        className="font-display text-2xl text-foreground hover:text-primary transition-colors"
      >
        FRIQUENCY RADIO
      </Link>

      <Card className="w-full max-w-sm">
        <CardContent className="p-6 flex flex-col gap-4">
          <h1 className="font-display text-3xl text-foreground dark:text-primary text-center">LOGIN</h1>

          <form className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <Input id="password" name="password" type="password" required />
            </div>
            <button
              type="submit"
              formAction={login}
              className="app-action-primary w-full py-2 text-sm font-semibold mt-1"
            >
              Login
            </button>
          </form>

          <div className="flex gap-2">
            <Link
              href="/signup"
              className="app-action-secondary flex-1 py-2 text-xs font-semibold text-center"
            >
              Sign Up
            </Link>
            <button
              onClick={async (e) => {
                e.preventDefault();
                try {
                  await anonymousSignIn();
                  router.push("/");
                  window.location.reload();
                } catch { /* handled */ }
              }}
              className="app-action-secondary flex-1 py-2 text-xs font-semibold"
            >
              Quick Jam
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
