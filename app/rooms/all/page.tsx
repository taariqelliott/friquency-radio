"use client";

import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { PostgrestError } from "@supabase/supabase-js";
import Spinner from "@/app/components/Spinner";

interface Room {
  id: string;
  name: string;
}

const supabase = createClient();

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
        <h6 className="text-green-500 text-sm font-bold cursor-pointer hover:text-green-300">
          Create a new room
        </h6>
      </div>
    );
  }

  return (
    <ul className="flex flex-col justify-center items-center">
      {rooms
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((room) => (
          <li key={room.id}>
            <Link
              href={`/rooms/${room.id}`}
              className="text-blue-600 hover:underline hover:text-pink-500 text-2xl"
            >
              {room.name}
            </Link>
          </li>
        ))}
    </ul>
  );
};

const RoomsPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <main className="flex flex-col items-center justify-center h-dvh p-24">
        <ListAllRooms />
      </main>
    </Suspense>
  );
};

export default RoomsPage;
