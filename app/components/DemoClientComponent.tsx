"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import Link from "next/link";
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
      <div className="flex flex-col items-center font-bold text-2xl text-pink-500 justify-center p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-lg shadow-lg m-2">
      <div className="text-sm text-green-500 text-center">Welcome to</div>
      <div className="text-sm text-black font-bold text-center bg-green-500 rounded p-2">
        FRIQUENCY RADIO
      </div>
      <div className="flex flex-row justify-center items-center mt-2 font-bold">
        <span className="text-green-500">@</span>
        <span className="text-white"> {profile.username || "Not set"}</span>
      </div>
      {user && (
        <div className="flex flex-col justify-center items-center ">
          <Link href="/rooms/all">
            <button className="mt-4 transition duration-200 text-green-500 text-center border border-pink-500 w-[200px] max-w-xs hover:bg-green-500 hover:text-black font-bold py-2 px-4 rounded">
              Join Station
            </button>
          </Link>
          <CreateRoom />
        </div>
      )}
    </div>
  );
}
