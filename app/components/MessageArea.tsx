"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Message {
  message_id: string;
  message_text: string;
  created_at: string;
  user_id: string;
  room_id: string;
  username?: string;
}

interface User {
  id: string;
  username: string;
}

const supabase = createClient();

const MessageArea = ({
  messages,
  room_id,
  user,
}: {
  messages: Message[];
  room_id: string;
  user: User;
}) => (
  <ul className="flex flex-col">
    {messages.map((message) => (
      <li key={message.message_id} className="max-w-80 w-full mb-4">
        <div className="bg-black border border-yellow-600 rounded-lg p-3 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <strong className="text-sm text-yellow-600">
              {message.username}
            </strong>
            <span className="text-xs text-blue-500">
              {new Date(message.created_at).toLocaleTimeString()}
            </span>
          </div>
          <div className="text-sm break-words text-white">
            {message.message_text}
          </div>
        </div>
      </li>
    ))}
  </ul>
);

const MessagesPage = ({ room_id, user }: { room_id: string; user: User }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: messagesData } = await supabase
          .from("chat")
          .select("*")
          .eq("room_id", room_id);

        const { data: usersData } = await supabase.from("users").select("*");

        const usersMap = new Map(
          usersData?.map((user) => [user.id, user.username])
        );
        const messagesWithUsernames =
          messagesData?.map((message) => ({
            ...message,
            username: usersMap.get(message.user_id),
          })) ?? [];

        setMessages(messagesWithUsernames);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading messages");
      }
    };

    const subscribeToRealTimeChanges = () => {
      const channel = supabase
        .channel("public:chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat" },
          (payload) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              payload.new as Message,
            ]);
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    fetchMessages();
    subscribeToRealTimeChanges();
  }, [room_id]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">All Messages</h1>
      <MessageArea messages={messages} room_id={room_id} user={user} />
    </main>
  );
};

export default MessagesPage;
