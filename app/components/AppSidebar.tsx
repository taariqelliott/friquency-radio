"use client";

import { createClient } from "@/utils/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  IconHome,
  IconMenu2,
  IconRadio,
  IconLogout,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { handleLogout } from "@/app/actions";

interface Room {
  id: string;
  name: string;
}

interface AppSidebarProps {
  roomId: string;
  currentUsername: string | null;
  isOwner: boolean;
}

function SidebarContent({
  roomId,
  currentUsername,
  isOwner,
}: AppSidebarProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from("rooms").select("id, name").order("name");
      if (data) setRooms(data);
    };

    fetchRooms();

    const channel = supabase
      .channel("sidebar:rooms")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rooms" },
        (payload) => {
          setRooms((prev) =>
            [...prev, payload.new as Room].sort((a, b) =>
              a.name.localeCompare(b.name)
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "rooms" },
        (payload) => {
          setRooms((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      <Link
        href="/"
        className="font-display text-2xl text-foreground hover:text-primary transition-colors"
      >
        FRIQUENCY RADIO
      </Link>

      <div className="flex flex-col gap-1">
        <Link href="/" className={buttonVariants({ variant: "ghost", className: "justify-start gap-2" })}>
          <IconHome size={16} /> Home
        </Link>
        <Link href="/rooms/all" className={buttonVariants({ variant: "ghost", className: "justify-start gap-2" })}>
          <IconRadio size={16} /> Stations
        </Link>
      </div>

      <Separator />

      <div className="flex flex-col gap-1">
        <p className="text-xs font-mono text-muted-foreground px-2 uppercase tracking-wider">Stations</p>
        <ScrollArea className="flex-1 max-h-[calc(100vh-280px)]">
          <div className="flex flex-col gap-1 pr-2">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.id}`}
                className={`rounded-md px-3 py-2 text-sm font-mono transition-colors hover:bg-accent hover:text-accent-foreground truncate ${
                  room.id === roomId
                    ? "bg-accent text-accent-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {room.name}
              </Link>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="mt-auto flex flex-col gap-2">
        <Separator />
        {currentUsername && (
          <div className="flex items-center justify-between">
            <span className="font-mono text-sm text-muted-foreground truncate">
              <span className="text-foreground dark:text-primary">@</span>{currentUsername}
              {isOwner && (
                <span className="ml-1 text-xs text-foreground dark:text-primary">(owner)</span>
              )}
            </span>
            <form action={handleLogout}>
              <Button variant="ghost" size="icon" type="submit" aria-label="Logout">
                <IconLogout size={16} />
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AppSidebar(props: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar h-dvh sticky top-0">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile trigger — rendered inside room page header area */}
      <div className="md:hidden fixed top-3 right-3 z-20">
        <Sheet>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" aria-label="Open navigation" />
            }
          >
            <IconMenu2 size={20} />
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-sidebar">
            <SidebarContent {...props} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
