"use client";
import { createClient } from "@/utils/supabase/client";
import { useMantineColorScheme, Button, MantineProvider } from "@mantine/core";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { IconBrightness2, IconMoonStars } from "@tabler/icons-react";

interface User {
  username: string;
}

export default function Header() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();

  const buttons = [
    { label: "home", onClick: () => (window.location.href = "/") },
    { label: "rooms", onClick: () => (window.location.href = "/rooms/all") },
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
        if (error) throw error;
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    }
  }, [supabase]);

  const sessionDependency = supabase.auth.getSession();
  const searchDependency = searchParams.get("auth");

  useEffect(() => {
    fetchUser();
  }, [fetchUser, searchDependency, sessionDependency]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <MantineProvider defaultColorScheme="dark">
      <div className="absolute z-10 text-white right-2 mt-2">
        <div className="flex flex-row items-start">
          {user && (
            <Link
              href="/profile/edit"
              className="hover:text-pink-500 mr-2 mt-[2px] hidden md:flex"
            >
              <span className="text-sm bg-black border rounded-md border-pink-500 px-2 py-1">
                <span className="text-green-500">@</span>
                {user.username}
              </span>
            </Link>
          )}
          <div className="flex flex-col gap-1">
            <Button
              variant="gradient"
              gradient={{ from: "#ec4899", to: "", deg: 90 }}
              onClick={toggleColorScheme}
              className="w-20 hover:opacity-40 transition-all duration-300"
            >
              {isClient &&
                (colorScheme === "dark" ? (
                  <IconBrightness2 stroke={2} />
                ) : (
                  <IconMoonStars stroke={2} />
                ))}
            </Button>
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
