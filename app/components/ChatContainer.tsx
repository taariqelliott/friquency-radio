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

interface ChatContainerProps {
  id: string;
}

const ChatContainer = ({ id }: ChatContainerProps) => {
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
    <section className="app-panel flex h-full w-full flex-col overflow-auto">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="app-kicker">Live Chat</div>
          <h2 className="text-xl font-semibold">Room Conversation</h2>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="text-center m-5 text-blue-500 text-2xl font-bold">
            loading chat...
          </div>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-auto ">
            <ChatMessages user={user} room_id={id} />
          </div>

          <div className="mt-auto">
            {!user ? (
              <div className="app-card text-center font-bold text-lime-500">
                <Link
                  href="/login"
                  className="hover:underline hover:text-blue-400"
                >
                  login
                </Link>
                {" or "}
                <Link
                  href="/signup"
                  className="hover:underline hover:text-blue-400"
                >
                  sign up
                </Link>
                {" to chat!"}
              </div>
            ) : (
              <ChatInput room_id={id} user_id={user.id} />
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default ChatContainer;
