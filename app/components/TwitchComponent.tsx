"use client";
import { useState, useEffect } from "react";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconSettings,
} from "@tabler/icons-react";
import { createClient } from "@/utils/supabase/client";
import { useDisclosure } from "@mantine/hooks";
import { Modal, TextInput, Button } from "@mantine/core";

interface Room {
  id: number;
  name: string;
  created_by: string;
}

export default function ClientPlayer({ room }: { room: Room }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState<string | null>(null);
  const [isRoomOwner, setIsRoomOwner] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);
  const [roomOwnerName, setRoomOwnerName] = useState<string | null>(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [editUsername, setEditUsername] = useState("");
  const supabase = createClient();

  const togglePlayback = () => {
    setIsPlaying((currentState) => !currentState);
  };

  useEffect(() => {
    const checkRoomOwnership = async () => {
      try {
        const { data: currentUserResponse } = await supabase.auth.getUser();
        const currentUserId = currentUserResponse?.user?.id;

        if (currentUserId) {
          const { data: currentUser } = await supabase
            .from("users")
            .select("username")
            .eq("id", currentUserId)
            .single();

          setCurrentUserName(currentUser?.username || null);
        }

        const { data: roomOwner } = await supabase
          .from("users")
          .select("username")
          .eq("id", room.created_by)
          .single();

        setRoomOwnerName(roomOwner?.username || null);
        setIsRoomOwner(currentUserName === roomOwnerName);

        const { data: twitchData, error: twitchError } = await supabase
          .from("users")
          .select("twitchUsername")
          .eq("id", room.created_by)
          .single();

        if (twitchError) {
          console.error("Error fetching Twitch username:", twitchError);
        } else {
          setTwitchUsername(twitchData.twitchUsername);
          setEditUsername(twitchData.twitchUsername || "");
        }
      } catch (error) {
        console.error("Error in checkRoomOwnership:", error);
      }
    };

    checkRoomOwnership();
  }, [supabase, room, currentUserName, roomOwnerName]);

  const handleUpdateUsername = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("users")
        .update({ twitchUsername: editUsername })
        .eq("id", user.id);

      if (error) throw error;

      setTwitchUsername(editUsername);
      close();
    } catch (error) {
      console.error("Error updating Twitch username:", error);
    }
  };

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "localhost";

  // Include multiple domains for local and production
  const twitchStream = `https://player.twitch.tv/?channel=${twitchUsername}&parent=${hostname}&parent=yourdomain.com&muted=false`;

  return (
    <div className="absolute top-4 left-4">
      <Modal
        opened={opened}
        onClose={close}
        title="Update Twitch Username"
        centered
      >
        <TextInput
          label="Twitch Username"
          value={editUsername}
          onChange={(event) => setEditUsername(event.currentTarget.value)}
          placeholder="Enter your Twitch username"
        />
        <Button onClick={handleUpdateUsername} className="mt-2">
          Update Username
        </Button>
      </Modal>

      <div className="">
        {(!currentUserName || currentUserName !== roomOwnerName) && (
          <button
            onClick={togglePlayback}
            className="play-button border-2 rounded-lg border-pink-500 p-2 bg-black text-green-500 hover:opacity-50"
          >
            {isPlaying ? <IconPlayerPause /> : <IconPlayerPlay />}
          </button>
        )}

        {currentUserName &&
          roomOwnerName &&
          currentUserName === roomOwnerName && (
            <button
              onClick={open}
              className="border-2 rounded-lg border-pink-500 p-2 bg-black text-green-500 hover:opacity-50 "
            >
              <IconSettings />
            </button>
          )}
      </div>

      {isPlaying && (
        <div>
          <iframe
            src={twitchStream}
            height="0"
            width="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            hidden
            data-tilt-gyroscope="false"
          ></iframe>
          <h1 className="mt-2">
            Currently playing{" "}
            <a
              className="text-green-500 hover:text-black hover:bg-green-500 hover:border-pink-500 bg-black rounded p-2 border-2 border-pink-500"
              href={twitchStream}
              target="_blank"
            >
              {twitchUsername}
            </a>
          </h1>
        </div>
      )}
    </div>
  );
}
