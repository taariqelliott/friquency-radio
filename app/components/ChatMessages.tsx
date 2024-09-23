import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import MessageList from "./MessageList";

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

const ChatMessages = ({
  room_id,
  user,
}: {
  room_id: string;
  user: User | null;
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const retrieveMessages = async () => {
      try {
        const { data: messagesData, error } = await supabase
          .from("chat")
          .select("*, users(username)")
          .eq("room_id", room_id);

        if (error) {
          throw error;
        }

        const messagesWithUsernames =
          messagesData?.map((message: any) => ({
            ...message,
            username: message.users?.username || "Unknown",
          })) ?? [];

        setMessages(messagesWithUsernames);
      } catch (error) {
        console.error("Error fetching messages:", error);
        setFetchError("Error loading messages");
      }
    };

    const subscribeToNewMessages = () => {
      const channel = supabase
        .channel("public:chat")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat",
            filter: `room_id=eq.${room_id}`,
          },
          async (payload) => {
            try {
              const { data: newMessageData, error } = await supabase
                .from("users")
                .select("username")
                .eq("id", payload.new.user_id)
                .single();

              if (error) {
                throw error;
              }

              const newMessage = {
                ...payload.new,
                username: newMessageData?.username || "Unknown",
              };

              setMessages((prevMessages) => [
                ...prevMessages,
                newMessage as Message,
              ]);
            } catch (error) {
              console.error("Error fetching new message username:", error);
            }
          }
        )
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    };

    retrieveMessages();
    const unsubscribe = subscribeToNewMessages();

    return () => {
      unsubscribe();
    };
  }, [room_id]);

  if (fetchError) {
    return <div>{fetchError}</div>;
  }

  return (
    <main className="flex flex-col-reverse items-center p-4 h-full">
      <MessageList messages={messages} user={user} />
    </main>
  );
};

export default ChatMessages;
