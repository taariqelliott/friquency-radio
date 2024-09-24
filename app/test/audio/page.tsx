"use client";

import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";
import {
  createLocalAudioTrack,
  AudioPresets,
  LocalParticipant,
} from "livekit-client"; // Ensure LocalParticipant is imported

export default function Page() {
  // Get user input for room and name
  const [room, setRoom] = useState("quickstart-room");
  const [name, setName] = useState(
    `user-${Math.random().toString(36).substring(7)}`
  ); // Generate a unique name
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
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
    >
      <RoomContent />
    </LiveKitRoom>
  );
}

function RoomContent() {
  const localParticipant = useLocalParticipant();

  useEffect(() => {
    const publishAudioTrack = async () => {
      if (localParticipant) {
        const audioTrack = await createLocalAudioTrack({
          channelCount: 2,
          echoCancellation: false,
          noiseSuppression: false,
        });

        // Check if localParticipant is of type LocalParticipant
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
  }, [localParticipant]);

  return (
    <>
      <RoomAudioRenderer />
      <ControlBar />
    </>
  );
}
