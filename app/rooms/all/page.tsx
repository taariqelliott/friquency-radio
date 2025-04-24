"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PostgrestError, User } from "@supabase/supabase-js";
import CreateRoom from "@/app/components/CreateRoom";
import { Table } from "@mantine/core";
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

  if (error) {
    console.error("Error fetching current user:", error.message);
    return null;
  }

  return currentUser?.username || null;
};

const RoomsPage = () => {
  const [scale, setScale] = useState(1);
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScale(0.8);
      else if (width < 768) setScale(0.95);
      else setScale(1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main
      className="flex flex-col items-center justify-center h-dvh gap-2"
      style={{ transform: `scale(${scale})` }}
    >
      {user && <CreateRoom />}
      <ListAllRooms />
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
      const username = await fetchCurrentUser();
      setCurrentUsername(username);

      const { data, error } = await supabase.from("rooms").select(`
        id,
        name,
        created_by,
        users:created_by (username)
      `);

      if (error) {
        setError(error);
      } else {
        const roomsWithCreators = data.map((room: any) => ({
          id: room.id,
          name: room.name,
          created_by: room.created_by,
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
    return <div className="text-pink-500 text-2xl font-bold">Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const rows = rooms
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((room) => (
      <Table.Tr key={room.id}>
        <Table.Td>
          <Link
            href={`/rooms/${room.id}`}
            className="text-blue-600 hover:underline font-bold"
          >
            {room.name}
          </Link>
        </Table.Td>
        <Table.Td>
          {room.username === currentUsername ? (
            <span className="text-green-500 font-bold">(You) 👑</span>
          ) : (
            <span className="text-pink-500">@{room.username}</span>
          )}
        </Table.Td>
        <Table.Td>
          <Link
            href={`/rooms/${room.id}`}
            className="bg-black text-green-500 border border-pink-500 px-2 py-1 rounded hover:bg-green-500 hover:text-black font-bold"
          >
            Enter
          </Link>
        </Table.Td>
        <Table.Td>
          {room.username === currentUsername ? (
            <button
              onClick={() => handleDelete(room.id)}
              className="bg-red-500 text-white border border-white text-xs rounded-lg hover:bg-red-700"
            >
              <span className="inline-block transition-all duration-500 hover:rotate-180 px-2 py-1 font-bold">
                X
              </span>
            </button>
          ) : (
            ""
          )}
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <div className="flex flex-col justify-around items-center">
      {rooms.length > 0 ? (
        <Table stickyHeader stickyHeaderOffset={60} striped withTableBorder>
          <Table.Caption>-Frequency Radio Stations-</Table.Caption>
          <Table.Thead>
            <Table.Tr>
              {currentUsername ? (
                <>
                  <Table.Th>Station Name</Table.Th>
                  <Table.Th>Creator</Table.Th>
                  <Table.Th>Actions</Table.Th>
                  <Table.Th>{""}</Table.Th>
                </>
              ) : (
                <>
                  <Table.Th>Station Name</Table.Th>
                  <Table.Th>Creator</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : (
        <div className="text-center text-pink-500 text-2xl mt-4">
          No Stations Found
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
