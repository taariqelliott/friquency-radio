"use client"

import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useRef, useState } from "react";
import {
  createLocalAudioTrack,
  AudioPresets,
  LocalParticipant,
} from "livekit-client";
import { IconVolume } from "@tabler/icons-react";
import { useMantineColorScheme } from "@mantine/core";

interface LiveRoomProps {
  isBroadcaster: boolean;
}

export default function LiveRoom({ isBroadcaster }: LiveRoomProps) {
  const [room] = useState("quickstart-room");
  const [name] = useState(`user-${Math.random().toString(36).substring(7)}`);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${room}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    };

    fetchToken();
  }, [room, name]);

  if (token === "") {
    return null; // Prevent rendering when token is not available
  }

  return (
    <LiveKitRoom
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="custom"
      options={{
        publishDefaults: {
          red: false,
        },
      }}
      style={{
        width: "auto",
        height: "auto",
        overflow: "hidden",
      }}
    >
      <RoomContent isBroadcaster={isBroadcaster} />
    </LiveKitRoom>
  );
}

interface RoomContentProps {
  isBroadcaster: boolean;
}

function RoomContent({ isBroadcaster }: RoomContentProps) {
  const localParticipant = useLocalParticipant();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false); // Close modal if clicked outside
      }
    };

    // Attach event listener
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Clean up event listener
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const publishAudioTrack = async () => {
      if (localParticipant && isBroadcaster) {
        const audioTrack = await createLocalAudioTrack({
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
        });

        if (localParticipant instanceof LocalParticipant) {
          await localParticipant.publishTrack(audioTrack, {
            audioPreset: AudioPresets.musicHighQualityStereo,
            dtx: false,
            red: false,
          });
        }
      }
    };

    publishAudioTrack();
  }, [localParticipant, isBroadcaster]);

  return (
    <div>
      <RoomAudioRenderer />
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={modalRef}
            className="bg-black p-4 rounded-lg shadow-lg w-full max-w-[90%] md:max-w-[600px] z-60"
          >
            <div className="relative">
              <div className="flex items-center justify-center w-full">
                <ControlBar
                  variation="minimal"
                  style={{
                    width: "100%",
                    color: colorScheme === "dark" ? "#22c55e" : "yellow",
                    padding: "5px",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {isBroadcaster && (
        <div>
          <button
            className={`${
              colorScheme === "dark" ? "text-green-500" : "text-black"
            }`}
            onClick={() => setIsModalOpen(true)}
          >
            <IconVolume size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
