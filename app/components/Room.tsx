"use client";

import { LiveKitRoom } from "@livekit/components-react";
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
    </LiveKitRoom>
  );
};
