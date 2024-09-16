import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import Spinner from "./Spinner";

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

const MessageList = ({
  messages,
  user,
}: {
  messages: Message[];
  user: User | null;
}) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <ul
      className="flex flex-col overflow-y-auto w-full"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {messages.map((message) => (
        <li
          key={message.message_id}
          className={`flex ${
            message.user_id === user?.id ? "justify-end" : "justify-start"
          } mb-4`}
        >
          <div
            className={`bg-black border border-gray-600 rounded-lg p-3 w-full sm:w-3/4 md:w-1/2 ${
              message.user_id === user?.id ? "bg-gray-800" : "bg-black"
            } break-words`}
          >
            <div className="flex items-center justify-between mb-2">
              <strong
                className={`text-sm ${
                  message.user_id === user?.id
                    ? "text-pink-400"
                    : "text-green-600"
                }`}
              >
                {message.user_id === user?.id ? (
                  <span className="text-green-600">@</span>
                ) : (
                  <span className="text-pink-400">@</span>
                )}
                {message.username || "Unknown"}
              </strong>
              <span
                className={`text-xs  ${
                  message.user_id === user?.id
                    ? "text-pink-400"
                    : "text-green-600"
                }`}
              >
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>
            <div className="text-sm text-white">{message.message_text}</div>
          </div>
        </li>
      ))}
      <div ref={endOfMessagesRef} />
    </ul>
  );
};

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
        setFetchError("Error loading messages");
      }
    };

    const subscribeToNewMessages = () => {
      const channel = supabase
        .channel("public:chat")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "chat" },
          async (payload) => {
            const { data: usersData } = await supabase
              .from("users")
              .select("*");
            const usersMap = new Map(
              usersData?.map((user) => [user.id, user.username])
            );
            const newMessage = {
              ...payload.new,
              username: usersMap.get(payload.new.user_id),
            };
            setMessages((prevMessages) => [
              ...prevMessages,
              newMessage as Message,
            ]);
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

  if (!messages.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner />
      </div>
    );
  }

  return (
    <main className="flex flex-col-reverse items-center p-4 h-full">
      <MessageList messages={messages} user={user} />
    </main>
  );
};

export default ChatMessages;
