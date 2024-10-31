"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import CopyURL from "@/app/components/CopyURL";
import Link from "next/link";
import ChatContainer from "@/app/components/ChatContainer";
import { AudioVisualizer } from "@/app/components/AudioVisualizer";

interface Room {
  id: string;
  name: string;
  created_by: string;
}

interface Params {
  id: string;
}

const RoomPage = ({ params }: { params: Params }) => {
  const { id } = params;
  const supabase = createClient();

  // State management
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<Room | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [roomOwnerUsername, setRoomOwnerUsername] = useState<string | null>(
    null
  );
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>([]);

  // Audio Context and nodes
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const audioBufferQueue = useRef<AudioBuffer[]>([]);
  const isPlayingRef = useRef(false);

  // Initialize AudioContext and Analyzer
  useEffect(() => {
    audioContextRef.current = new AudioContext();
    analyserNodeRef.current = audioContextRef.current.createAnalyser();
    analyserNodeRef.current.fftSize = 256;
    analyserNodeRef.current.connect(audioContextRef.current.destination);

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Room and user data fetching
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const { data: roomData, error: roomError } = await supabase
          .from("rooms")
          .select("id, name, created_by")
          .eq("id", id)
          .single();

        if (roomError || !roomData) {
          console.error("Room error:", roomError);
          notFound();
          return;
        }

        setRoom(roomData);

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("username")
          .eq("id", roomData.created_by)
          .single();

        if (userError) {
          console.error("Error fetching user:", userError);
          setError("Error fetching room owner information");
        } else {
          setRoomOwnerUsername(user.username);
        }
      } catch (error) {
        console.error("Error in fetchRoomData:", error);
        setError("Error fetching room data");
      } finally {
        setLoading(false);
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const { data: currentUserResponse } = await supabase.auth.getUser();
        const currentUserId = currentUserResponse?.user?.id;

        if (currentUserId) {
          const { data: currentUser, error: userError } = await supabase
            .from("users")
            .select("username")
            .eq("id", currentUserId)
            .single();

          if (userError) {
            console.error("Error fetching current user:", userError);
            setError("Error fetching user information");
          } else {
            setCurrentUsername(currentUser?.username || null);
          }
        }
      } catch (error) {
        console.error("Error in fetchCurrentUser:", error);
        setError("Error fetching current user data");
      }
    };

    fetchRoomData();
    fetchCurrentUser();
  }, [id, supabase]);

  // Audio visualization update
  const updateVisualizerData = useCallback(() => {
    if (!analyserNodeRef.current) return;

    const dataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
    analyserNodeRef.current.getByteFrequencyData(dataArray);
    setVisualizerData(Array.from(dataArray));

    requestAnimationFrame(updateVisualizerData);
  }, []);

  // Audio buffer playback
  const playNextBuffer = useCallback(() => {
    if (
      !audioContextRef.current ||
      !analyserNodeRef.current ||
      audioBufferQueue.current.length === 0
    ) {
      isPlayingRef.current = false;
      return;
    }

    isPlayingRef.current = true;
    const buffer = audioBufferQueue.current.shift();

    if (buffer) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(analyserNodeRef.current);

      source.onended = () => {
        playNextBuffer();
      };

      source.start(0);
      sourceNodeRef.current = source;
    }
  }, []);

  // Audio chunk fetching and playing
  const fetchLatestAudioChunk = useCallback(async () => {
    if (!audioContextRef.current || currentUsername === roomOwnerUsername)
      return;

    try {
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("room_id", id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data.length > 0) {
        const audioUrl = data[0].url;

        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();

        const audioBuffer = await audioContextRef.current.decodeAudioData(
          arrayBuffer
        );
        audioBufferQueue.current.push(audioBuffer);

        if (!isPlayingRef.current) {
          playNextBuffer();
          updateVisualizerData();
        }
      }
    } catch (error) {
      console.error("Error in fetchLatestAudioChunk:", error);
      setError("Error loading latest audio chunk");
    }
  }, [
    id,
    supabase,
    currentUsername,
    roomOwnerUsername,
    updateVisualizerData,
    playNextBuffer,
  ]);

  useEffect(() => {
    const interval = setInterval(fetchLatestAudioChunk, 1000);
    return () => clearInterval(interval);
  }, [fetchLatestAudioChunk]);

  // Audio chunk upload
  const uploadChunkToSupabase = useCallback(
    async (chunk: BlobPart, chunkIndex: number) => {
      try {
        const fileName = `audio-chunk-${Date.now()}-${chunkIndex}.webm`;
        const file = new File([chunk], fileName, {
          type: "audio/webm; codecs=opus",
        });

        const { data, error: uploadError } = await supabase.storage
          .from("streams")
          .upload(`rooms/${id}/${fileName}`, file, {
            contentType: "audio/webm",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("streams").getPublicUrl(data.path);

        const { error: insertError } = await supabase.from("streams").insert({
          room_id: id,
          file_name: fileName,
          url: publicUrl,
          created_at: new Date().toISOString(),
        });

        if (insertError) throw insertError;
      } catch (error) {
        console.error("Error in chunk upload process:", error);
        setError("Error during chunk upload process");
      }
    },
    [id, supabase]
  );

  // Device handling
  const handleDeviceChange = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );

      setInputDevices(audioInputDevices);

      if (selectedDeviceId === null && audioInputDevices.length > 0) {
        setSelectedDeviceId(audioInputDevices[0].deviceId);
      }
    } catch (error) {
      console.error("Error enumerating devices:", error);
      setError("Error accessing audio devices");
    }
  }, [selectedDeviceId]);

  useEffect(() => {
    handleDeviceChange();
  }, [handleDeviceChange]);

  // Recording controls
  const startRecording = useCallback(async () => {
    if (!selectedDeviceId) {
      setError("No audio device selected");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: selectedDeviceId },
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
        audioBitsPerSecond: 128000,
      });

      let chunkIndex = 0;

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await uploadChunkToSupabase(event.data, chunkIndex++);
        }
      };

      recorder.start(1000);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setError(null);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Error starting recording");
      setIsRecording(false);
    }
  }, [selectedDeviceId, uploadChunkToSupabase]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-dvh pt-4 bg-gray-900">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      <div className="flex flex-col text-center items-center justify-center p-4 rounded-lg bg-gray-800 shadow-xl mb-4">
        <div className="z-10 text-white hover:text-green-400 transition-all duration-200">
          <Link href="/">FRIQUENCY RADIO</Link>
        </div>
        <div className="text-2xl text-blue-400">
          📡{" "}
          <span className="text-pink-400 hover:text-pink-600 cursor-pointer transition-all duration-200">
            {room?.name}
          </span>{" "}
          📡
        </div>
        <p className="text-green-400 text-sm">
          Curated by:{" "}
          <span className="font-bold">
            {"@" + (roomOwnerUsername || "Unknown")}
          </span>
        </p>
        <div className="p-2 hover:opacity-75">
          <CopyURL />
        </div>
      </div>

      {roomOwnerUsername === currentUsername && (
        <div className="mb-4">
          <select
            id="audioDevices"
            value={selectedDeviceId || ""}
            onChange={(e) => setSelectedDeviceId(e.target.value)}
            className="bg-gray-700 text-white rounded px-3 py-2 mr-2"
          >
            <option value="" disabled>
              Select an audio device
            </option>
            {inputDevices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Device ${device.deviceId}`}
              </option>
            ))}
          </select>

          <button
            onClick={handleRecord}
            className={`px-4 py-2 rounded-lg font-semibold ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            } text-white transition-all duration-200`}
          >
            {isRecording ? "Stop Broadcasting" : "Start Broadcasting"}
          </button>
        </div>
      )}

      <AudioVisualizer data={visualizerData} />
      <ChatContainer id={id} />
    </main>
  );
};

export default RoomPage;
