import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CopyURL from "@/app/components/CopyURL";
import Link from "next/link";
import MessagesPage from "@/app/components/MessageArea";

interface Room {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
}

const RoomPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = createClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", id)
    .single();

  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("id", room?.created_by)
    .single();

  if (error || !room) {
    notFound();
  }

  return (
    <main className="flex flex-col items-center justify-center h-dvh">
      <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-gray-700">
        <div className="z-10 hover:text-realOrange text-white transition-all duration-200">
          <Link href={"/"}>FRIQUENCY RADIO</Link>
        </div>
        <div className="text-2xl text-blue-500">
          📡 Now listening to Radio Station{" "}
          <span className="text-pink-400 hover:text-pink-600 hover:cursor-pointer">
            {room.name}
          </span>{" "}
          📡
        </div>
        <div className="p-2 hover:opacity-75">
          <CopyURL />
        </div>
        <p className="text-realOrange">Room ID: {room.id}</p>
        <p className="text-green-500">Created by: {user.username}</p>
        <p className="text-yellow-300">Created at: {room.created_at}</p>
      </div>
      <MessagesPage room_id={id} user={user} />
    </main>
  );
};

export default RoomPage;
