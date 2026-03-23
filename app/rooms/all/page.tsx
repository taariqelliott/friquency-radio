"use client";

import CreateRoom from "@/app/components/CreateRoom";
import { createClient } from "@/utils/supabase/client";
import { Table } from "@mantine/core";
import { PostgrestError, User } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DeleteRoom } from "./DeleteRoom";

interface Room {
  id: string;
  name: string;
  created_by: string;
  username: string;
  audio_path?: string | null;
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

  if (error) {
    console.error("Error fetching current user:", error.message);
    return null;
  }

  return currentUser?.username || null;
};

const RoomsPage = () => {
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  return (
    <main className="min-h-dvh px-4 pb-6 pt-24 md:px-8">
      <div className="app-shell flex min-h-[calc(100dvh-7.5rem)] flex-col gap-4">
        <section className="app-panel flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="app-kicker">Directory</div>
            <h1 className="text-4xl font-bold tracking-tight">All Stations</h1>
            <p className="app-copy max-w-2xl">
              Browse public rooms, jump into the chat, and see which stations
              already have audio loaded.
            </p>
          </div>
          {user && <CreateRoom />}
        </section>

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
    const fetchRoomsAndCurrentUser = async () => {
      const [username, roomsResponse] = await Promise.all([
        fetchCurrentUser(),
        supabase.from("rooms").select(`
          id,
          name,
          created_by,
          audio_path,
          users:created_by (username)
        `),
      ]);

      setCurrentUsername(username);

      const { data, error } = roomsResponse;

      if (error) {
        setError(error);
      } else {
        const roomsWithCreators = data.map((room: any) => ({
          id: room.id,
          name: room.name,
          created_by: room.created_by,
          audio_path: room.audio_path,
          username: room.users.username,
        }));
        setRooms(roomsWithCreators);
      }

      setLoading(false);
    };

    fetchRoomsAndCurrentUser();

    const channel = supabase
      .channel("public:rooms")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rooms" },
        (payload: { new: Room }) => {
          console.log("New room created:", payload.new);
          setRooms((prevRooms) => [...prevRooms, payload.new]);
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "rooms" },
        (payload: { old: any }) => {
          console.log("Room deleted:", payload.old);
          setRooms((prevRooms) =>
            prevRooms.filter((room) => room.id !== payload.old.id)
          );
        }
      )
      .subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log("Realtime channel subscribed");
        }
        if (err) {
          console.error("Realtime subscription error:", err);
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (roomId: string) => {
    const isDeleted = await DeleteRoom(roomId);

    if (isDeleted) {
      setRooms((prevRooms) => prevRooms.filter((room) => room.id !== roomId));
    } else {
      alert("Failed to delete the room. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="app-panel text-center text-2xl font-bold text-blue-500">
        Loading...
      </div>
    );
  }

  if (error) {
    return <div className="app-panel text-center">Error: {error.message}</div>;
  }

  const rows = rooms
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((room) => (
      <Table.Tr key={room.id}>
        <Table.Td className="min-w-[320px] align-top">
          <Link
            href={`/rooms/${room.id}`}
            className="block whitespace-normal break-words py-1 text-base font-bold text-blue-600 hover:underline"
          >
            {room.name}
          </Link>
        </Table.Td>
        <Table.Td className="align-top py-3">
          {room.username === currentUsername ? (
            <span className="text-lime-500 font-bold">(You) 👑</span>
          ) : (
            <span className="text-blue-500">@{room.username}</span>
          )}
        </Table.Td>
        <Table.Td className="align-top py-3">
          {room.audio_path ? (
            <span className="text-lime-500 font-bold">Track Ready</span>
          ) : (
            <span className="text-stone-400">No Audio</span>
          )}
        </Table.Td>
        <Table.Td className="align-top py-3">
          <Link
            href={`/rooms/${room.id}`}
            className="app-action-secondary px-3 py-2 text-sm"
          >
            Enter
          </Link>
        </Table.Td>
        {currentUsername && (
          <Table.Td className="align-top py-3">
            {room.username === currentUsername ? (
              <button
                onClick={() => handleDelete(room.id)}
                className="app-action-danger px-3 py-2 text-xs"
              >
                Delete
              </button>
            ) : (
              ""
            )}
          </Table.Td>
        )}
      </Table.Tr>
    ));

  return (
    <div className="app-panel flex-1 min-h-0">
      {rooms.length > 0 ? (
        <div className="h-full overflow-auto rounded-2xl border app-divider">
          <Table
            striped
            withTableBorder
            className="min-w-[920px]"
          >
            <Table.Caption>-Friquency Radio Stations-</Table.Caption>
            <Table.Thead>
              <Table.Tr>
                {currentUsername ? (
                  <>
                    <Table.Th className="min-w-[320px]">Station Name</Table.Th>
                    <Table.Th>Creator</Table.Th>
                    <Table.Th>Audio</Table.Th>
                    <Table.Th>Actions</Table.Th>
                    <Table.Th>{""}</Table.Th>
                  </>
                ) : (
                  <>
                    <Table.Th className="min-w-[320px]">Station Name</Table.Th>
                    <Table.Th>Creator</Table.Th>
                    <Table.Th>Audio</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </>
                )}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </div>
      ) : (
        <div className="text-center text-2xl font-bold text-blue-500">
          No Stations Found
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
