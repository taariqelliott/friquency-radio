import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

interface Room {
  id: string;
  name: string;
}

const ListAllRooms = ({ rooms }: { rooms: Room[] }) => {
  return (
    <ul className="flex flex-col">
      {rooms.map((room) => (
        <li key={room.id}>
          <Link
            href={`/rooms/${room.id}`}
            className="text-blue-600 hover:underline hover:text-yellow-500"
          >
            {room.name}
          </Link>
        </li>
      ))}
    </ul>
  );
};

const RoomsPage = async () => {
  const supabase = createClient();
  const { data: rooms, error } = await supabase.from("rooms").select("*");
  console.log("Fetched rooms:", rooms);

  if (error) {
    console.error("Error fetching rooms:", error);
    return <div>Error loading rooms</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center h-dvh p-24">
      <h1 className="text-2xl font-bold mb-4">Available Rooms</h1>
      <ListAllRooms rooms={rooms} />
    </main>
  );
};

export default RoomsPage;
