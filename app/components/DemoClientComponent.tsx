"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import CreateRoom from "./CreateRoom";

type Profile = {
  username: string | null;
};

export default function DemoClientComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>({ username: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.log("No user found");
        setLoading(false);
        return;
      }

      setUser(authData.user);

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("username")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      } else {
        setProfile(profileData || { username: null });
      }

      setLoading(false);
    }

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center font-mono text-sm text-muted-foreground justify-center p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      <div className="flex items-center gap-2 text-sm">
        <span className="font-mono font-semibold text-background flex justify-center w-full">
          @{profile.username || "not set"}
        </span>
      </div>
      {user && (
        <>
          <Link
            href="/rooms/all"
            className="py-2 text-sm font-semibold text-center rounded-md bg-background text-foreground hover:opacity-90 transition-opacity"
          >
            Browse Stations
          </Link>
          <CreateRoom />
        </>
      )}
    </div>
  );
}
