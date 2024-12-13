import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import CopyURL from "@/app/components/CopyURL";
import Link from "next/link";
import ChatContainer from "@/app/components/ChatContainer";
import TwitchClientPlayer from "../../components/TwitchComponent";
import RoomsPage from "../all/page";
import AllRoomsPage from "@/app/components/AllRoomsList";

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
    <main className="flex flex-col items-center justify-start h-dvh pt-6">
      <div className="lg:scale-110 md:scale-100 sm:scale-90 scale-90">
        {user?.username && currentUser?.username === user.username && (
          <div className="flex justify-center opacity-0 w-full">
            <h3 className="text-white bg-red-600 p-1 m-1 text-sm rounded-lg border-2 border-black">
              {"Room Owner"}
            </h3>
          </div>
        )}

        <div className="flex flex-col items-center justify-center sm:p-2 rounded-lg bg-gray-700 mx-auto p-1 mt-5">
          <div className=" hover:text-realGreen text-white transition-all duration-200 hidden md:block">
            <Link href="/">FRIQUENCY RADIO</Link>
          </div>

          <div className="text-2xl mt-1">
            📡{" "}
            <span className="text-pink-500 hover:text-pink-600 cursor-pointer transition-all duration-200">
              {room.name}
            </span>{" "}
            📡
          </div>

          <p className="text-green-500 text-sm px-2">
            By:{" "}
            <span className="font-bold">
              {"@" + (user?.username || "Unknown")}
            </span>
          </p>

          <div className="p-1 pb-2 hover:opacity-75 ">
            <CopyURL />
          </div>
        </div>
      </div>

      <TwitchClientPlayer room={room} />
      <ChatContainer id={id} />
    </main>
  );
};
export default RoomPage;
