"use client";

import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { useEffect, useState } from "react";

export default function Page() {
  // TODO: get user input for room and name
  const room = "quickstart-room";
  const name = "quickstart-user";
  const [token, setToken] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await fetch(
          `/api/get-participant-token?room=${room}&username=${name}`
        );
        const data = await resp.json();
        setToken(data.token);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  if (token === "") {
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      video={false} // Disable video
      audio={true} // Enable audio
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Use the default LiveKit theme for nice styles.
      data-lk-theme="default"
      style={{ height: "100dvh" }}
    >
      {/* No video conference component needed, just RoomAudioRenderer */}
      <RoomAudioRenderer />
      {/* Controls for the user to start/stop audio and to leave the room. */}
      <ControlBar />
    </LiveKitRoom>
  );
}
