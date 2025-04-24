import { useEffect, useRef, useState } from "react";

interface Message {
  message_id: string;
  message_text: string;
  image_url?: string;
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
  const [loadingImages, setLoadingImages] = useState(new Set<string>());

  useEffect(() => {
    if (loadingImages.size === 0) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loadingImages]);

  const handleImageLoad = (messageId: string) => {
    setLoadingImages((prev) => {
      const updatedLoadingImages = new Set(prev);
      updatedLoadingImages.delete(messageId);
      return updatedLoadingImages;
    });
  };

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const messageSegments = text.split(urlRegex);

    return messageSegments.map((segment, index) =>
      urlRegex.test(segment) ? (
        <a
          key={index}
          href={segment}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          {segment}
        </a>
      ) : (
        segment
      )
    );
  };

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
                className={`text-xs ${
                  message.user_id === user?.id
                    ? "text-pink-400"
                    : "text-green-600"
                }`}
              >
                {new Date(message.created_at).toLocaleTimeString()}
              </span>
            </div>

            <div className="text-sm text-white">
              {renderMessageText(message.message_text)}
            </div>

            {message.image_url && (
              <img
                src={message.image_url}
                alt="Uploaded"
                className="mt-2 max-w-full rounded"
                onLoad={() => handleImageLoad(message.message_id)}
                onError={() => handleImageLoad(message.message_id)}
                onLoadStart={() => {
                  setLoadingImages((prev) =>
                    new Set(prev).add(message.message_id)
                  );
                }}
              />
            )}
          </div>
        </li>
      ))}
      <div ref={endOfMessagesRef} />
    </ul>
  );
};

export default MessageList;
