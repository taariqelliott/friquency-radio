"use client";
import { createClient } from "@/utils/supabase/client";
import { useMantineColorScheme, Button, MantineProvider } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

interface User {
  username: string;
}

export default function Header() {
  const { setColorScheme, clearColorScheme } = useMantineColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();

  const buttons = [
    { label: "light", onClick: () => setColorScheme("light") },
    { label: "dark", onClick: () => setColorScheme("dark") },
    { label: "home", onClick: () => (window.location.href = "/") },
    { label: "rooms", onClick: () => (window.location.href = "/rooms/all") },
    // { label: "auto", onClick: () => setColorScheme("auto") },
    // { label: "clear", onClick: clearColorScheme },
  ];

  const fetchUser = useCallback(async () => {
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile, error } = await supabase
          .from("users")
          .select("username")
          .eq("id", authUser.id)
          .single();
        if (error) {
          throw error;
        }
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  }, [supabase, setUser]);
  const sessionDepedency = supabase.auth.getSession();
  const searchDependency = searchParams.get("auth");

  useEffect(() => {
    fetchUser();
  }, [fetchUser, searchDependency, sessionDepedency]);

  return (
    <MantineProvider>
      <div className="absolute z-10 text-white right-2 mt-2">
        <div className="flex flex-row items-start">
          {user && (
            <Link
              href="/profile/edit"
              className="hover:text-pink-500 mr-2 mt-[2px]"
            >
              <span className="text-sm bg-black border rounded-md border-pink-500 px-2 py-1">
                <span className="text-green-500">@</span>
                {user.username || "Guest"}
              </span>
            </Link>
          )}
          <div className="flex flex-col gap-1">
            {buttons.map((button, index) => (
              <Button
                key={index}
                variant="gradient"
                gradient={{ from: "#ec4899", to: "", deg: 90 }}
                onClick={button.onClick}
                className="w-20 hover:opacity-40 transition-all duration-300"
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </MantineProvider>
  );
}
