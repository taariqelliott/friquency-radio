"use client";

import CreateRoom from "@/app/components/CreateRoom";
import { createClient } from "@/utils/supabase/client";
import { PostgrestError, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteRoom } from "./DeleteRoom";

interface Room {
  id: string;
  name: string;
  created_by: string;
  username: string;
}

const supabase = createClient();

const fetchCurrentUser = async () => {
  const { data: currentUserResponse } = await supabase.auth.getUser();
  const currentUserId = currentUserResponse?.user?.id ?? null;
  if (!currentUserId) return null;
  const { data: currentUser, error } = await supabase
    .from("users")
    .select("username")
    .eq("id", currentUserId)
    .single();
  if (error) return null;
  return currentUser?.username || null;
};

const RoomsPage = () => {
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <main className="min-h-dvh p-8">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        <div>
          <p className="font-mono text-xs text-muted-foreground uppercase tracking-wider mb-1">Browse</p>
          <h1 className="font-display text-5xl text-foreground">Stations</h1>
        </div>
        {user && <CreateRoom />}
        <ListAllRooms />
      </div>
    </main>
  );
};

const ListAllRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const init = async () => {
      const username = await fetchCurrentUser();
      setCurrentUsername(username);

      const { data, error } = await supabase.from("rooms").select(`
        id, name, created_by,
        users:created_by (username)
      `);

      if (error) {
        setError(error);
      } else {
        setRooms(
          data
            .map((room: any) => ({
              id: room.id,
              name: room.name,
              created_by: room.created_by,
              username: room.users.username,
            }))
            .sort((a: Room, b: Room) => a.name.localeCompare(b.name))
        );
      }
      setLoading(false);
    };

    init();

    const channel = supabase
      .channel("public:rooms")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rooms" },
        (payload: { new: Room }) => {
          setRooms((prev) =>
            [...prev, payload.new].sort((a, b) => a.name.localeCompare(b.name))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "rooms" },
        (payload: { old: any }) => {
          setRooms((prev) => prev.filter((r) => r.id !== payload.old.id));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleDelete = async (roomId: string) => {
    const isDeleted = await DeleteRoom(roomId);
    if (isDeleted) {
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    }
  };

  if (loading) {
    return (
      <div className="font-mono text-sm text-muted-foreground">Loading stations...</div>
    );
  }

  if (error) {
    return <div className="text-destructive text-sm">{error.message}</div>;
  }

  if (rooms.length === 0) {
    return (
      <div className="font-mono text-sm text-muted-foreground">
        No stations yet. Create the first one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rooms.map((room, i) => (
        <div
          key={room.id}
          className="app-card flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300"
          style={{ animationDelay: `${i * 30}ms` }}
        >
          <div className="min-w-0">
            <h2 className="font-display text-2xl truncate text-foreground">{room.name}</h2>
            <p className="font-mono text-xs text-muted-foreground">
              {room.username === currentUsername ? (
                <span className="text-foreground dark:text-primary">@{room.username} (you)</span>
              ) : (
                <span>@{room.username}</span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/rooms/${room.id}`}
              className="app-action-primary text-sm px-4 py-1.5"
            >
              Enter
            </Link>
            {room.username === currentUsername && (
              <button
                onClick={() => handleDelete(room.id)}
                className="app-action-danger text-sm px-3 py-1.5"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RoomsPage;
