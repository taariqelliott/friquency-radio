"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

type Profile = {
  username: string | null;
};

export default function Profile() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile>({ username: null });
  const [username, setUsername] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function getUserData() {
      const supabase = createClient();

      // Get user authentication data
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

      // Fetch the user's profile data (including username)
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
      setUsername(""); // Clear the input field after update
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
      }}
    >
      <h1>Profile</h1>
      <div>Email: {user?.email}</div>
      <div>ID: {user?.id}</div>
      <div>Username: {profile.username || "No username set"}</div>
      <input
        type="text"
        placeholder="Enter new username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ margin: "1rem 0", padding: "0.5rem", fontSize: "1rem" }}
      />
      <button onClick={updateUsername} style={{ padding: "0.5rem 1rem" }}>
        Update Username
      </button>
    </div>
  );
}
