"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@mantine/core";
import { useEffect, useState } from "react";

type Profile = {
  username: string | null;
};

export default function ProfileEditPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile>({ username: null });
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();

    async function getUserData() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;
      setUser({
        id: userId,
        email: authData.user.email!,
      });

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError.message);
      } else {
        setProfile(profileData || { username: null });
      }
      setLoading(false);
    }

    getUserData();
  }, []);

  const updateUsername = async () => {
    if (!user || !username) {
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating username:", error.message);
    } else {
      setUsername("");
      setProfile({ username });
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-2xl text-center text-pink-500 font-bold">
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      {user?.email && <div>Email: {user?.email}</div>}
      <div className="text-green-500 bg-black border-pink-500 border rounded p-1 px-2">
        Username:{" "}
        <span className="text-white font-bold">
          {profile.username || "No username set"}
        </span>
      </div>
      <form action="submit" onSubmit={updateUsername}>
        <input
          type="text"
          placeholder="Enter new username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            margin: "1rem 0",
            padding: "0.5rem",
            fontSize: "1rem",
            textAlign: "center",
          }}
        />
      </form>
      <Button
        variant="outline"
        color="#22c55e"
        style={{ padding: "0.5rem 1rem" }}
        onClick={updateUsername}
      >
        Update Username
      </Button>
    </div>
  );
}
