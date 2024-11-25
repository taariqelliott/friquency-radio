import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CopyURL from "@/app/components/CopyURL";
import Link from "next/link";
import ChatContainer from "@/app/components/ChatContainer";
import ClientPlayer from "../../components/TwitchComponent";

const RoomPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = createClient();

  // Fetch room data
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, name, created_by")
    .eq("id", id)
    .single();

  if (roomError || !room) {
    notFound();
  }

  // Fetch current user data
  const { data: currentUserResponse } = await supabase.auth.getUser();
  const currentUsername = currentUserResponse?.user?.id ?? null;

  // Fetch current user's username if logged in
  const { data: currentUser } = currentUsername
    ? await supabase
        .from("users")
        .select("username")
        .eq("id", currentUsername)
        .single()
    : { data: null };

  // Fetch room owner's username
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
      {user?.username && currentUser?.username === user.username && (
        <div>
          <h3 className="text-white bg-red-600 p-1 m-1 text-sm rounded-lg border-2 border-black">
            Start Stream
          </h3>
        </div>
      )}
      <ClientPlayer room={room} />
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
          Curated by:{" "}
          <span className="font-bold">
            {"@" + (user?.username || "Unknown")}
          </span>
        </p>
        <div className="p-2 hover:opacity-75">
          <CopyURL />
        </div>
      </div>
      <ChatContainer id={id} />
    </main>
  );
};

export default RoomPage;
