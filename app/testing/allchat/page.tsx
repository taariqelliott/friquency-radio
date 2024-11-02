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
      const { data: usersData } = await supabase.from("users").select("*");
      setMessages(messagesData);
      setUsers(usersData);
    };
    fetchData();
  }, [supabase]);

  return (
    <div className="flex flex-col items-center justify-center h-dvh text-center">
      {messages?.map((message: any, id) => {
        const user = users?.find((user: any) => user.id === message.user_id);
        return (
          <div
            key={id}
            className="flex flex-row mx-auto w-[550px] text-pretty items-center justify-center"
          >
            <p>
              <span className="font-bold text-sky-400">{user?.username}:</span>
              <span className="font-bold text-green-500">
                {" "}
                {message.message_text}
              </span>
            </p>
          </div>
        );
      })}
    </div>
  );
}
