import { LiveKitRoom } from "@livekit/components-react";
import { AudioInputPlayback } from "./AudioUserInputPlayback";

type RoomProps = {
  token: string;
  wsUrl: string;
};

export const Room = ({ token, wsUrl }: RoomProps) => {
  return (
    <LiveKitRoom token={token} serverUrl={wsUrl} connect={true}>
      <AudioInputPlayback />
    </LiveKitRoom>
  );
};
