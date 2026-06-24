"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  IconBrightness2,
  IconHome,
  IconMenu2,
  IconMoonStars,
  IconRadio,
  IconX,
} from "@tabler/icons-react";
import { useTheme } from "next-themes";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import ProfileEditPage from "../profile/edit/page";

interface User {
  username: string;
}

export default function Header() {
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [supabase] = useState(() => createClient());
  const searchParams = useSearchParams();

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
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
    } catch {
      setUser(null);
    }
  }, [supabase]);

  useEffect(() => { fetchUser(); }, [fetchUser, searchParams.get("auth")]);
  useEffect(() => { setIsClient(true); }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <>
      <div className="fixed right-3 top-3 z-20">
        <div className="flex items-start gap-2">
          {user && (
            <button
              onClick={() => setModalOpen(true)}
              className="app-pill hidden md:inline-flex"
            >
              <span className="text-foreground dark:text-primary">@</span>
              {user.username}
            </button>
          )}

          <div className="app-panel-soft hidden items-center gap-2 p-2 md:flex">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle color scheme"
            >
              {isClient && (theme === "dark" ? (
                <IconBrightness2 size={20} />
              ) : (
                <IconMoonStars size={20} />
              ))}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/")}
              aria-label="Home"
            >
              <IconHome size={20} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (window.location.href = "/rooms/all")}
              aria-label="Stations"
            >
              <IconRadio size={20} />
            </Button>
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
            >
              <IconMenu2 size={20} />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-64 bg-background border-l border-border p-4 flex flex-col gap-3">
            <div className="flex justify-between items-center mb-2">
              <span className="font-display text-xl text-foreground dark:text-primary">FRIQUENCY</span>
              <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(false)}>
                <IconX size={18} />
              </Button>
            </div>
            {user && (
              <button
                onClick={() => { setModalOpen(true); setDrawerOpen(false); }}
                className="app-pill justify-start"
              >
                <span className="text-foreground dark:text-primary">@</span>{user.username}
              </button>
            )}
            <Button variant="ghost" onClick={toggleTheme} className="justify-start gap-2">
              {isClient && (theme === "dark" ? <IconBrightness2 size={18} /> : <IconMoonStars size={18} />)}
              Toggle theme
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = "/"; setDrawerOpen(false); }} className="justify-start gap-2">
              <IconHome size={18} /> Home
            </Button>
            <Button variant="ghost" onClick={() => { window.location.href = "/rooms/all"; setDrawerOpen(false); }} className="justify-start gap-2">
              <IconRadio size={18} /> Stations
            </Button>
          </div>
        </div>
      )}

      {/* Profile edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative bg-card border border-border rounded-lg p-6 w-full max-w-sm mx-4">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2"
              onClick={() => setModalOpen(false)}
            >
              <IconX size={16} />
            </Button>
            <h2 className="font-semibold mb-4">Edit profile</h2>
            <ProfileEditPage />
          </div>
        </div>
      )}
    </>
  );
}
