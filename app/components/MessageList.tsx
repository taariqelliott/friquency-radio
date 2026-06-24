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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadingImages, setLoadingImages] = useState(new Set<string>());

  useEffect(() => {
    if (loadingImages.size === 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loadingImages]);

  const handleImageLoad = (messageId: string) => {
    setLoadingImages((prev) => {
      const updated = new Set(prev);
      updated.delete(messageId);
      return updated;
    });
  };

  const renderMessageText = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const messageSegments = text.split(urlRegex);

    return messageSegments.map((segment, index) => {
      const isUrl = /^https?:\/\/[^\s]+$/.test(segment);
      if (isUrl) {
        return (
          <a
            key={index}
            href={segment}
            target="_blank"
            rel="noopener noreferrer"
            className="underline opacity-80 hover:opacity-100"
          >
            {segment}
          </a>
        );
      }
      return <span key={index}>{segment}</span>;
    });
  };

  return (
    <div
      ref={scrollRef}
      className="flex flex-col overflow-y-auto w-full h-full"
    >
      {/* pushes messages to the bottom when list is short */}
      <div className="flex-1" />
      <ul className="flex flex-col gap-2 w-full p-3">
        {messages.map((message) => {
          const isOwn = message.user_id === user?.id;
          return (
            <li
              key={message.message_id}
              className={`flex flex-col animate-in slide-in-from-bottom-2 duration-150 ${
                isOwn ? "items-end" : "items-start"
              }`}
            >
              <span
                className={`text-xs text-muted-foreground mb-1 px-1 ${
                  isOwn ? "text-right" : "text-left"
                }`}
              >
                {isOwn ? "You" : `@${message.username || "Unknown"}`}
              </span>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm break-words ${
                  isOwn
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-card text-card-foreground border border-border rounded-bl-sm"
                }`}
              >
                <div>{renderMessageText(message.message_text)}</div>
                {message.image_url && (
                  <img
                    src={message.image_url}
                    alt="Uploaded"
                    className="mt-2 max-h-48 max-w-full rounded-xl object-contain"
                    onLoad={() => handleImageLoad(message.message_id)}
                    onError={() => handleImageLoad(message.message_id)}
                    onLoadStart={() =>
                      setLoadingImages((prev) =>
                        new Set(prev).add(message.message_id)
                      )
                    }
                  />
                )}
              </div>
              <span className="text-xs text-muted-foreground mt-1 px-1">
                {new Date(message.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MessageList;
