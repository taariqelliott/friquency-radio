"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PostgrestError, User } from "@supabase/supabase-js";
import CreateRoom from "@/app/components/CreateRoom";
import { Table } from "@mantine/core";

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
  const [user, setUser] = useState<null | User>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    fetchUser();
  }, []);

  return (
    <main className="flex flex-col items-center justify-center h-dvh p-24">
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
      // Fetch the current user's username
      const username = await fetchCurrentUser();
      setCurrentUsername(username);

      // Fetch rooms with creator usernames
      const { data, error } = await supabase.from("rooms").select(`
        id,
        name,
        created_by,
        users:created_by (username)
      `);

      if (error) {
        setError(error);
      } else {
        // Map the result to flatten the username into the room object
        const roomsWithCreators = data.map((room: any) => ({
          id: room.id,
          name: room.name,
          created_by: room.created_by,
          username: room.users.username, // Extract username from the joined data
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
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

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
        <Table.Td style={{ width: "33.33%" }}>
          <Link
            href={`/rooms/${room.id}`}
            className="text-blue-600 hover:underline"
          >
            {room.name}
          </Link>
        </Table.Td>
        <Table.Td style={{ width: "33.33%" }}>
          {room.username === currentUsername ? (
            <span className="text-green-500 font-bold">(You) 👑</span>
          ) : (
            <span className="text-pink-500">@{room.username}</span>
          )}
        </Table.Td>
        <Table.Td style={{ width: "33.33%" }}>
          <Link
            href={`/rooms/${room.id}`}
            className="bg-black text-green-500 border border-pink-500 px-2 py-1 rounded hover:bg-gray-900"
          >
            Enter
          </Link>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <div className="w-full max-w-3xl flex flex-col justify-around">
      {rooms.length > 0 ? (
        <Table stickyHeader stickyHeaderOffset={60}>
          <Table.Caption>-Friquency Radio Stations-</Table.Caption>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: "33.33%" }}>Room Name</Table.Th>
              <Table.Th style={{ width: "33.33%" }}>Creator</Table.Th>
              <Table.Th style={{ width: "33.33%" }}>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      ) : (
        <div className="text-center text-pink-500 text-2xl mt-4">
          No Rooms Found
        </div>
      )}
    </div>
  );
};

export default RoomsPage;
