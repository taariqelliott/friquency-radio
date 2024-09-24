import { useEffect, useRef, useCallback } from "react";
import { Track } from "livekit-client";
import { useLocalParticipant } from "@livekit/components-react";

export const AudioInputPlayback = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioDestinationNodeRef =
    useRef<MediaStreamAudioDestinationNode | null>(null);
  const publishedTrack = useRef<MediaStreamTrack | null>(null);
  const { localParticipant } = useLocalParticipant();

  const cleanup = useCallback(() => {
    if (publishedTrack.current) {
      localParticipant.unpublishTrack(publishedTrack.current);
      publishedTrack.current = null;
    }
    if (audioSourceNodeRef.current) {
      audioSourceNodeRef.current.disconnect();
      audioSourceNodeRef.current = null;
    }
    if (audioDestinationNodeRef.current) {
      audioDestinationNodeRef.current.disconnect();
      audioDestinationNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  }, [localParticipant]);

  const startAudio = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create audio source node from the user's input stream
      audioSourceNodeRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      // Connect the audio source node to a MediaStreamAudioDestinationNode
      audioDestinationNodeRef.current =
        audioContextRef.current.createMediaStreamDestination();
      audioSourceNodeRef.current.connect(audioDestinationNodeRef.current);

      // Publish the audio track to the LiveKit room
      publishedTrack.current =
        audioDestinationNodeRef.current.stream.getAudioTracks()[0];
      localParticipant.publishTrack(publishedTrack.current, {
        name: "user_audio_input",
        source: Track.Source.Microphone,
      });
    } catch (error) {
      console.error("Error accessing user media: ", error);
      cleanup();
    }
  };

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return (
    <>
      <button onClick={startAudio}>Start Audio</button>
    </>
  );
};
