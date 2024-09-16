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
    async function getUserData() {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.log("No user logged in");
        setLoading(false);
        return;
      }

      setUser({
        id: authData.user.id,
        email: authData.user.email!,
      });

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

    getUserData();
  }, []);

  const updateUsername = async () => {
    if (!user || !username) return;

    setLoading(true);
    const supabase = createClient();

    const { error } = await supabase
      .from("users")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating username:", error.message);
    } else {
      setProfile((prev) => ({ ...prev, username }));
      setUsername("");
    }

    setLoading(false);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        height: "100vh",
      }}
    >
      <h1>Profil Edit Page</h1>
      <div>Email: {user?.email}</div>
      <div>ID: {user?.id}</div>
      <div>Username: {profile.username || "No username set"}</div>
      <input
        type="text"
        placeholder="enter new username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{
          margin: "1rem 0",
          padding: "0.5rem",
          fontSize: "1rem",
          textAlign: "center",
        }}
      />
      <Button
        variant="outline"
        color="green"
        onClick={updateUsername}
        style={{ padding: "0.5rem 1rem" }}
      >
        Update Username
      </Button>
    </div>
  );
}
