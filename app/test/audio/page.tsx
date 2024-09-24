"use client";

import {
  LiveKitRoom,
  RoomAudioRenderer,
  ControlBar,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

export default function AudioStreamingPage() {
  const room = "audio-stream-room"; // Define the room name or get it dynamically
  const username = "user-audio"; // Define or fetch the username dynamically
  const [token, setToken] = useState("");

  // Fetch the participant token for LiveKit
  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${room}&username=${username}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error("Error fetching token", e);
      }
    })();
  }, [room, username]);

  // Handle token fetch state
  if (token === "") {
    return <div>Getting token...</div>;
  }

  // Ensure a user gesture before starting audio context
  const startAudioContext = () => {
    const audioContext = new window.AudioContext();
    audioContext.resume().then(() => {
      console.log("AudioContext resumed");
    });
  };

  return (
    <div onClick={startAudioContext}>
      {/* LiveKitRoom is responsible for handling the real-time connection */}
      <LiveKitRoom
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        audio={true} // Enable audio streaming
        video={false} // Disable video
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        {/* Room-wide audio playback */}
        <RoomAudioRenderer />
        {/* Control bar for muting/unmuting audio */}
        <ControlBar />
      </LiveKitRoom>
    </div>
  );
}
