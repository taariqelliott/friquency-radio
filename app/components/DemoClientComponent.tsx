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
      <div className="flex flex-col items-center font-bold text-2xl text-blue-500 justify-center p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-2 text-center">
      <div className="app-kicker">Welcome To</div>
      <div className="app-pill bg-lime-500 text-black border-transparent">
        FRIQUENCY RADIO
      </div>
      <div className="flex flex-row items-center justify-center font-bold">
        <span className="text-lime-500">@</span>
        <span> {profile.username || "Not set"}</span>
      </div>
      {user && (
        <div className="flex flex-col items-center justify-center gap-3">
          <Link href="/rooms/all">
            <button className="app-action-primary mt-2 w-[200px] max-w-xs">
              Join Station
            </button>
          </Link>
          <CreateRoom />
        </div>
      )}
    </div>
  );
}
