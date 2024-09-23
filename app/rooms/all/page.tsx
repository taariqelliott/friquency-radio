"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PostgrestError, User } from "@supabase/supabase-js";
import CreateRoom from "@/app/components/CreateRoom";

interface Room {
  id: string;
  name: string;
}

const supabase = createClient();

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from("rooms").select("*");
      if (error) {
        setError(error);
      } else {
        setRooms(data);
      }
      setLoading(false);
    };
    fetchRooms();

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
    <div className="flex flex-col">
      <ul className="flex flex-col text-pretty m-1 overflow-auto">
        {rooms
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((room) => (
            <li key={room.id} className="m-1 p-1">
              <span className="text-pink-500">•</span>{" "}
              <Link
                href={`/rooms/${room.id}`}
                className="text-blue-600 bg-black hover:underline border-l-2 p-1 border-b-2 rounded-sm border-pink-500 hover:text-green-500"
              >
                {room.name}
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default RoomsPage;
