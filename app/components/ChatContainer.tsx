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
    <div className="flex flex-col w-[97%] max-w-screen-lg h-[100%] overflow-auto border border-stone-600 rounded-lg p-3 mb-2 mt-5 mx-auto">
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
              <div className="bg-black text-center text-lime-500 p-2 border border-stone-600 font-bold rounded-md">
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
    </div>
  );
};

export default ChatContainer;
