import AppSidebar from "@/app/components/AppSidebar";
import ChatContainer from "@/app/components/ChatContainer";
import PlayerCard from "@/app/components/PlayerCard";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Station — fRIQuencyRADIO",
};

const RoomPage = async ({ params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = createClient();

  const { data: room, error: roomError } = await supabase
    .from("rooms")
    .select("id, name, created_by, audio_url, audio_filename")
    .eq("id", id)
    .single();

  if (roomError || !room) notFound();

  const { data: currentUserResponse } = await supabase.auth.getUser();
  const currentUserId = currentUserResponse?.user?.id ?? null;

  const { data: currentUser } = currentUserId
    ? await supabase
        .from("users")
        .select("username")
        .eq("id", currentUserId)
        .single()
    : { data: null };

  const { data: ownerUser } = await supabase
    .from("users")
    .select("username")
    .eq("id", room.created_by)
    .single();

  const isOwner =
    !!currentUser?.username &&
    !!ownerUser?.username &&
    currentUser.username === ownerUser.username;

  return (
    <div className="flex h-dvh overflow-hidden">
      <AppSidebar
        roomId={id}
        currentUsername={currentUser?.username ?? null}
        isOwner={isOwner}
      />
      <main className="flex flex-1 flex-col overflow-hidden">
        <PlayerCard room={room} isOwner={isOwner} />
        <ChatContainer id={id} />
      </main>
    </div>
  );
};

export default RoomPage;
