"use client";

declare global {
  interface Window {
    LKRoom: any;
  }
}

import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { createLocalAudioTrack, AudioPresets } from "livekit-client";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

export default function AudioOnlyPage() {
  const room = "quickstart-room";
  const name = `user-${Math.random().toString(36).substring(7)}`;
  const [token, setToken] = useState("");
  const [isRoomVisible, setIsRoomVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(
          `/api/get-participant-token?room=${room}&username=${name}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    })();
  }, []);

  useEffect(() => {
    async function handleRoomConnected() {
      if (!isRoomVisible) return;
      const room = (await fetchRoom()) as { localParticipant: any };
      const localParticipant = room.localParticipant;

      try {
        const audioTrack = await createLocalAudioTrack({
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
        });

        await localParticipant.publishTrack(audioTrack, {
          audioBitrate: 510000,
          dtx: false,
          red: false,
        });
      } catch (error) {
        console.error("Error publishing audio track:", error);
      }
    }

    if (token && isRoomVisible) {
      handleRoomConnected();
    }
  }, [token, isRoomVisible]);

  if (!token) {
    return <div>Getting token...</div>;
  }

  const toggleRoomVisibility = () => {
    setIsRoomVisible(!isRoomVisible);
  };

  return (
    <div>
      <button onClick={toggleRoomVisibility} className="m-5">
        Audio
      </button>

      <div
        className={`${
          isRoomVisible ? "flex" : "hidden"
        } fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 justify-center items-center z-50`}
      >
        <div className="relative rounded-lg shadow-lg">
          <LiveKitRoom
            audio={true}
            video={false}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            className="w-full h-full"
          >
            <RoomAudioRenderer />
            <ControlBar />
            <button
              onClick={toggleRoomVisibility}
              className="absolute top-[-20px] right-[-20px] bg-red-500 hover:bg-red-600 text-white w-8 h-8 border-none rounded-full cursor-pointer flex items-center justify-center z-50"
            >
              ×
            </button>
          </LiveKitRoom>
        </div>
      </div>
    </div>
  );

  async function fetchRoom() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const room = window.LKRoom;
        if (room) {
          clearInterval(interval);
          resolve(room);
        }
      }, 100);
    });
  }
}
