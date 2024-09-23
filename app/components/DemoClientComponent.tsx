"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

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
    <div className="flex flex-col items-center justify-center p-4 text-center text-pretty">
      <h1>Client Component</h1>
      <div>Username: {profile.username || "Not set"}</div>
      {(user?.is_anonymous && <div></div>) || <div>Email: {user?.email} </div>}
      <div>ID: {user?.id || "Not available"}</div>
    </div>
  );
}
