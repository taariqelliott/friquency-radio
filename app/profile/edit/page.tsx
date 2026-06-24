"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
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
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setLoading(false);
        return;
      }

      const userId = authData.user.id;
      setUser({ id: userId, email: authData.user.email! });

      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("username")
        .eq("id", userId)
        .single();

      if (!profileError) setProfile(profileData || { username: null });
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

    if (!error) {
      setProfile({ username });
      setUsername("");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-dvh">
        <span className="font-mono text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh p-8">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 flex flex-col gap-4">
          <h1 className="font-display text-3xl text-foreground dark:text-primary text-center">Edit Profile</h1>

          {user?.email && (
            <p className="font-mono text-xs text-muted-foreground text-center">{user.email}</p>
          )}

          <div className="app-card flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">Current username</span>
            <span className="font-mono text-sm text-foreground dark:text-primary font-bold">
              @{profile.username || "not set"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            <Input
              type="text"
              placeholder="New username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateUsername()}
            />
            <Button variant="outline" onClick={updateUsername} disabled={loading || !username}>
              Update Username
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
