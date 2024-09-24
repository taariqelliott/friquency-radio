"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import { AudioUserInputPlayback } from "./AudioUserInputPlayback";

type RoomProps = {
  token: string;
  wsUrl: string;
};

export const Room = ({ token, wsUrl }: RoomProps) => {
  return (
    <LiveKitRoom token={token} serverUrl={wsUrl} connect={true}>
      {/* This will stream the user's microphone input */}
      <AudioUserInputPlayback />
      {/* Ensure the RoomAudioRenderer is present to play audio from other participants */}
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
};
