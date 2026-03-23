import ChatContainer from "@/app/components/ChatContainer";
import CopyURL from "@/app/components/CopyURL";
import RoomAudioPlayer from "@/app/components/RoomAudioPlayer";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";

const RoomPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = createClient();

  // Fetch room data
  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select(
      "id, name, created_by, audio_path, audio_title, audio_mime_type, audio_size_bytes"
    )
    .eq("id", id)
    .single();

  if (roomError || !room) {
    notFound();
  }

  // Fetch current user data
  const { data: currentUserResponse } = await supabase.auth.getUser();
  const currentUserId = currentUserResponse?.user?.id ?? null;
  const isRoomOwner = currentUserId === room.created_by;

  // Fetch room owner's username
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("username")
    .eq("id", room.created_by)
    .maybeSingle();

  if (userError) {
    console.error("Error fetching user:", userError);
  }

  return (
    <main className="app-page">
      <div className="app-shell space-y-6">
        <section className="app-panel flex flex-col items-center gap-4 text-center">
          <div className="app-kicker">
            {isRoomOwner ? "Your Station" : "Public Station"}
          </div>

          <div className="space-y-2">
            <div className="hidden transition-all duration-200 hover:text-blue-500 md:block">
              <Link href="/">FRIQUENCY RADIO</Link>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-blue-500">
              {room.name}
            </h1>
            <p className="text-sm font-semibold text-lime-500">
              {"@" + (user?.username || "Unknown")}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {user?.username && isRoomOwner && (
              <span className="app-pill border-red-500/30 bg-red-500/10 text-red-400">
                Room Owner
              </span>
            )}
            <CopyURL />
          </div>
        </section>

        <RoomAudioPlayer room={room} isRoomOwner={isRoomOwner} />
        <ChatContainer id={id} />
      </div>
    </main>
  );
};
export default RoomPage;
