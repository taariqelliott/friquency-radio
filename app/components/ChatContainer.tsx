"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ChatMessages from "./MessageList";
import ChatInput from "./MessageInput";

interface User {
  id: string;
  username: string;
}

interface ChatContainerProps {
  id: string;
}

const ChatContainer = ({ id }: ChatContainerProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient();
      const { data: currentUser } = await supabase.auth.getUser();
      if (currentUser?.user) {
        setUser({
          id: currentUser.user.id,
          username: currentUser.user.user_metadata?.username || "",
        });
      }
    };

    fetchCurrentUser();
  }, [id]);

  return (
    <div className="flex flex-col w-[97%] max-w-screen-lg h-[100%] overflow-auto border border-gray-600 rounded-lg p-3 mb-3 mt-3 mx-auto">
      <div className="flex-grow overflow-auto mb-4">
        <ChatMessages room_id={id} user={user} />
      </div>
      {user && (
        <div className="mt-auto">
          <ChatInput room_id={id} user_id={user.id} />
        </div>
      )}
    </div>
  );
};

export default ChatContainer;
