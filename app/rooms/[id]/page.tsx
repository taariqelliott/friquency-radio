import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CopyURL from "@/app/components/CopyURL";
import Link from "next/link";
import ChatContainer from "@/app/components/ChatContainer";
import AudioStream from "@/app/components/AudioStream";

const RoomPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = createClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select("id, name, created_by")
    .eq("id", id)
    .single();

  if (error || !room) {
    notFound();
  }

  const { data: user, error: userError } = await supabase
    .from("users")
    .select("username")
    .eq("id", room.created_by)
    .single();

  if (userError) {
    console.error("Error fetching user:", userError);
    notFound();
  }

  return (
    <main className="flex flex-col items-center justify-center h-dvh pt-4">
      <div className="flex flex-col text-center text-pretty items-center justify-center p-4 rounded-lg bg-gray-700">
        <div className="z-10 hover:text-realGreen text-white transition-all duration-200">
          <Link href="/">FRIQUENCY RADIO</Link>
        </div>
        <div className="text-2xl text-blue-500">
          📡{" "}
          <span className="text-pink-400 hover:text-pink-600 cursor-pointer transition-all duration-200">
            {room.name}
          </span>{" "}
          📡
        </div>
        <p className="text-green-500 text-sm">
          Curated by: <span className="font-bold">{"@" + user?.username}</span>
        </p>
        <div className="p-2 hover:opacity-75">
          <CopyURL />
        </div>
      </div>

      <div className="flex items-center justify-center mt-4 border border-gray-300 rounded-lg p-4">
        <div className="flex-1">
          <AudioStream />{" "}
        </div>
        <div className="flex-1 ml-4">
          <ChatContainer id={id} />
        </div>
      </div>
    </main>
  );
};

export default RoomPage;
