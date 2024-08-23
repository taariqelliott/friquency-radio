"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function DemoClientComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.log("No user found");
      } else {
        setUser(data.user);
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1>Client Component</h1>
      <div>Email: {user?.email || "Not available"}</div>
      <div>ID: {user?.id || "Not available"}</div>
      <div>Role: {user?.role ? user.role : "Not logged in"}</div>
    </div>
  );
}
