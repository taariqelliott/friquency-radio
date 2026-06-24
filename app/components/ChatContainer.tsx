"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useEffect, useState } from "react";
import ChatMessages from "./ChatMessages";
import ChatInput from "./MessageInput";

interface User {
  id: string;
  username: string;
}

const ChatContainer = ({ id }: { id: string }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    };
    fetchCurrentUser();
  }, [id]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 gap-3">
      <div>
        <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider">Live Chat</p>
        <h2 className="text-lg font-semibold">Room Conversation</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-sm text-muted-foreground">Loading chat...</span>
          </div>
        ) : (
          <ChatMessages user={user} room_id={id} />
        )}
      </div>

      <div className="mt-auto">
        {!loading && !user ? (
          <div className="app-card text-center text-sm">
            <Link href="/login" className="text-primary hover:underline">Login</Link>
            {" or "}
            <Link href="/signup" className="text-primary hover:underline">Sign up</Link>
            {" to chat"}
          </div>
        ) : user ? (
          <ChatInput room_id={id} user_id={user.id} />
        ) : null}
      </div>
    </div>
  );
};

export default ChatContainer;
