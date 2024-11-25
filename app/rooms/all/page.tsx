"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PostgrestError, User } from "@supabase/supabase-js";
import CreateRoom from "@/app/components/CreateRoom";

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

  if (rooms.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center">
        <div className="text-pink-500 text-2xl font-bold">No Rooms Found</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start items-start">
      <ul className="flex flex-col text-pretty m-1 overflow-auto">
        {rooms
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((room) => (
            <li key={room.id} className="m-2 p-1">
              <span className="text-pink-500">• </span>
              <Link
                href={`/rooms/${room.id}`}
                className="text-blue-600 bg-black hover:underline border-l-2 p-1 border-b-2 rounded-sm border-pink-500 text-xl hover:text-green-500"
              >
                {room.name}
              </Link>
              <span> -</span>
              <span className="ml-4 text-sm">
                {room.username === currentUsername ? (
                  <span className="bg-black text-green-500 border border-pink-500 p-1 rounded-sm">
                    My Room
                  </span>
                ) : (
                  <span className="text-gray-400">
                    Created by: {room.username}
                  </span>
                )}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
