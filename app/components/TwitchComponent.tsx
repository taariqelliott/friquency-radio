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

export default function TwitchClientPlayer({ room }: { room: Room }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // State for visibility
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

  const toggleVisibility = () => {
    setIsVisible((currentState) => !currentState);
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

  const twitchStream = `https://player.twitch.tv/?channel=${twitchUsername}&parent=${hostname}&parent=yourdomain.com&muted=false`;

  return (
    <div>
      <div className="absolute top-2 left-2">
        <Modal
          opened={opened}
          onClose={close}
          title="Update Twitch Username"
          centered
        >
          <TextInput
            label="Twitch Username:"
            // className="text-center"
            value={editUsername}
            onChange={(event) => setEditUsername(event.currentTarget.value)}
            placeholder="Enter your Twitch username"
          />
          <div className="flex items-center justify-center">
            <Button
              onClick={handleUpdateUsername}
              color="green"
              className="mt-2"
            >
              Update Username
            </Button>
          </div>
        </Modal>

        <div>
          <div className="flex flex-col justify-start">
            <div className="flex flex-row justify-start">
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
                currentUserName !== roomOwnerName && (
                  <button
                    onClick={toggleVisibility}
                    className="ml-2 border-2 rounded-lg border-blue-500 p-2 bg-black text-white hover:opacity-75"
                  >
                    {isVisible ? "Hide" : "Show"}
                  </button>
                )}
            </div>

            <div className="mt-2">
              {isPlaying && (
                <a
                  className="text-sm text-green-500 hover:text-black hover:bg-green-500 hover:border-pink-500 bg-black rounded p-1 border-2 border-pink-500 md:hidden"
                  href={twitchStream}
                  target="_blank"
                >
                  @{twitchUsername}
                </a>
              )}
              {isPlaying && (
                <h1 className="hidden md:block mt-2">
                  Currently playing{" "}
                  <a
                    className="text-green-500 hover:text-black hover:bg-green-500 hover:border-pink-500 bg-black rounded p-2 border-2 border-pink-500"
                    href={twitchStream}
                    target="_blank"
                  >
                    @{twitchUsername}
                  </a>
                </h1>
              )}
            </div>
          </div>

          {currentUserName &&
            roomOwnerName &&
            currentUserName === roomOwnerName && (
              <div className="flex flex-col justify-start">
                <button
                  onClick={open}
                  className="border-2 absolute left-0 top-0 rounded-lg border-pink-500 p-2 bg-black text-green-500 hover:opacity-50"
                >
                  <IconSettings className="" />
                </button>
              </div>
            )}
        </div>
      </div>

      <div className={isVisible ? "relative pt-3" : "hidden"}>
        <iframe
          src={`${twitchStream}&autoplay=${isPlaying ? "true" : "false"}`}
          width="100%"
          height="calc(75% * 9 / 16)"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; allow-fullscreen"
          data-tilt-gyroscope="false"
        ></iframe>
      </div>
    </div>
  );
}
