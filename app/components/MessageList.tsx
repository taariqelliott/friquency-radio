import { useEffect, useRef } from "react";

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

export default MessageList;
