"use client";
import { createClient } from "@/utils/supabase/client";
import { Button, Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconSettings,
  IconVideo,
  IconVideoOff,
  IconVolume,
  IconVolumeOff,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";

interface Room {
  id: number;
  name: string;
  created_by: string;
}

export default function TwitchClientPlayer({ room }: { room: Room }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
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
    <div className={isVisible ? "mb-[-12px]" : "mb-1"}>
      <div className="absolute top-2 left-2">
        <Modal
          opened={opened}
          onClose={close}
          title="Update Twitch Username"
          centered
        >
          <TextInput
            label="Twitch Username:"
            value={editUsername}
            onChange={(event) => setEditUsername(event.currentTarget.value)}
            placeholder="Enter your Twitch username"
          />
          <div className="flex items-center justify-center">
            <Button
              onClick={handleUpdateUsername}
              color="lime"
              className="mt-2"
            >
              Update Username
            </Button>
          </div>
        </Modal>

        <div>
          <div className="flex flex-col justify-start">
            <div className="flex flex-col gap-y-2 justify-start">
              <div className="">
                <a
                  className="text-lime-500 text-xs hover:text-black font-bold hover:bg-lime-500 hover:border-blue-600 bg-black rounded p-1 border-2 border-blue-500 md:hidden"
                  href={twitchStream}
                  target="_blank"
                >
                  @{twitchUsername}
                </a>

                <h1 className="hidden font-bold md:block">
                  Now playing:{" "}
                  <a
                    className="text-lime-500 hover:text-black text-sm font-bold hover:bg-lime-500 hover:border-blue-600 bg-black rounded px-2 py-1 border-2 border-blue-500"
                    href={twitchStream}
                    target="_blank"
                  >
                    @{twitchUsername}
                  </a>
                </h1>
              </div>
              {currentUserName &&
                roomOwnerName &&
                currentUserName === roomOwnerName && (
                  <div className="flex flex-col justify-start ">
                    <button
                      onClick={open}
                      className="border-2 mt-1 w-12 flex justify-center items-center rounded-lg border-blue-500 p-2 bg-black text-lime-500 hover:bg-lime-500 hover:text-black"
                    >
                      <IconSettings className="" />
                    </button>
                  </div>
                )}

              <button
                onClick={togglePlayback}
                className="play-button border-2 w-12 items-center justify-center flex rounded-lg border-blue-500 p-2 bg-black text-lime-500 hover:bg-lime-500 hover:text-black"
              >
                {isPlaying ? <IconVolume /> : <IconVolumeOff />}
              </button>

              <button
                onClick={toggleVisibility}
                className="border-2 rounded-lg w-12 border-blue-500 text-lime-500 flex items-center justify-center p-2 bg-black hover:bg-lime-500 hover:text-black"
              >
                {isVisible ? <IconVideoOff /> : <IconVideo />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={
          isVisible
            ? "relative lg:mt-4 md:mt-2 sm:mt-0 mt-3 border-blue-500 border-2"
            : "hidden"
        }
      >
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
