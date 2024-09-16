"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import ChatMessages from "./MessageList";
import ChatInput from "./MessageInput";
import Link from "next/link";

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
    <div className="flex flex-col w-[97%] max-w-screen-lg h-[100%] overflow-auto border border-gray-600 rounded-lg p-3 mb-3 mt-3 mx-auto">
      {loading ? (
        // Center the loading spinner/message both vertically and horizontally
        <div className="flex justify-center items-center h-full">
          <div className="text-center m-5 text-pink-400 font-bold">
            loading chat...
          </div>
        </div>
      ) : (
        <>
          {/* Chat messages container */}
          <div className="flex-grow overflow-auto mb-4">
            <ChatMessages room_id={id} user={user} />
          </div>

          {/* Conditionally render input or login prompt */}
          <div className="mt-auto">
            {!user ? (
              <div className="bg-black text-center text-green-500 p-2 border border-gray-600 font-bold rounded-md">
                <Link
                  href="/login"
                  className="hover:underline hover:text-pink-400"
                >
                  Login
                </Link>
                {" or "}
                <Link
                  href="/signup"
                  className="hover:underline hover:text-pink-400"
                >
                  Sign Up
                </Link>
                {" to chat!"}
              </div>
            ) : (
              <ChatInput room_id={id} user_id={user.id} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatContainer;
