'use client';

import {
  ControlBar,
  LiveKitRoom,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { useEffect, useState } from 'react';

export default function AudioOnlyPage() {
  // Define the room name and participant name (these can be customized as needed)
  const room = 'quickstart-room';
  const name = 'quickstart-user';
  const [token, setToken] = useState('');

  useEffect(() => {
    // Fetch the token for authentication when the component mounts
    (async () => {
      try {
        const response = await fetch(
          `/api/get-participant-token?room=${room}&username=${name}`
        );
        const data = await response.json();
        setToken(data.token);
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    })();
  }, []);

  // Show a loading message while fetching the token
  if (!token) {
    return <div>Getting token...</div>;
  }

  return (
    <LiveKitRoom
      audio={true} // Enable audio
      video={false} // Ensure video is disabled
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      // Apply the default LiveKit theme
      data-lk-theme="default"
      style={{ height: '100dvh' }}
    >
      {/* Render only audio components */}
      <RoomAudioRenderer />
      {/* Control bar for managing audio and leaving the room */}
      <ControlBar />
    </LiveKitRoom>
  );
}
