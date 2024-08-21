"use client";

import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function DemoClientComponent() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getUser() {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.log("no user");
      } else {
        setUser(data.user);
      }
    }
    getUser();
  }, []);
  console.log({ user });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid white",
        padding: "1rem",
      }}
    >
      <h1>Client Component</h1>
      <div>email: {user?.email}</div>
      <div>id: {user?.id}</div>
      {user?.role ? <div>role: {user?.role}</div> : <div>not logged in</div>}
    </div>
  );
}
