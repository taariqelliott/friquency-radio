"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";

export default function Page() {
  const supabase = createClient();
  const [messages, setMessages] = useState<any[] | null>(null);
  const [users, setUsers] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: messagesData } = await supabase.from("chat").select("*");
      setMessages(messagesData);

      const { data: usersData } = await supabase.from("users").select("*");
      setUsers(usersData);
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-svh">
      {messages?.map((message: any, id) => {
        const user = users?.find((user: any) => user.id === message.user_id);
        return (
          <div key={id}>
            <p>
              {user?.username}: {message.message_text}
            </p>
          </div>
        );
      })}
    </div>
  );
}
