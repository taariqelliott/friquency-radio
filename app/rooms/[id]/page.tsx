"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { notFound } from "next/navigation";
import CopyURL from "@/app/components/CopyURL";
import Link from "next/link";
import ChatContainer from "@/app/components/ChatContainer";

interface Params {
  id: string;
}

const RoomPage = ({ params }: { params: Params }) => {
  const { id } = params;
  const supabase = createClient();

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);
  const [roomOwnerUsername, setRoomOwnerUsername] = useState<string | null>(null);
  const [inputDevices, setInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        console.log("Fetching room data...");
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

        console.log("Room data fetched:", roomData);
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
          console.log("Room owner username fetched:", user.username);
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
        console.log("Fetching current user...");
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
            console.log("Current user fetched:", currentUser);
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

  const fetchLatestAudioChunk = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("streams")
        .select("*")
        .eq("room_id", id)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching latest audio chunk:", error);
        setError("Error loading latest audio chunk");
        return;
      }

      if (data.length > 0 && audioRef.current) {
        const audioUrl = data[0].url;
        const audioElement = audioRef.current;
        audioElement.src = audioUrl; // Update the source URL directly
        audioElement.load();
        audioElement.play();
      }
    } catch (error) {
      console.error("Error in fetchLatestAudioChunk:", error);
      setError("Error loading latest audio chunk");
    }
  }, [id, supabase]);

  useEffect(() => {
    const interval = setInterval(fetchLatestAudioChunk, 1000); // Fetch latest chunk every second
    return () => clearInterval(interval);
  }, [fetchLatestAudioChunk]);

  const uploadChunkToSupabase = useCallback(
    async (chunk: BlobPart, chunkIndex: number) => {
      try {
        const fileName = `audio-chunk-${Date.now()}-${chunkIndex}.webm`;
        const file = new File([chunk], fileName, { type: "audio/webm" });

        const { data, error: uploadError } = await supabase.storage
          .from("streams")
          .upload(`rooms/${id}/${fileName}`, file, {
            upsert: true,
          });

        if (uploadError) {
          console.error("Error uploading chunk to storage:", uploadError);
          setError("Error uploading audio chunk");
          return;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("streams").getPublicUrl(data.path);

        const { error: insertError } = await supabase.from("streams").insert({
          room_id: id,
          file_name: fileName,
          url: publicUrl,
        });

        if (insertError) {
          console.error("Error inserting stream record:", insertError);
          setError("Error saving audio chunk information");
          return;
        }

        console.log("Chunk upload successful:", publicUrl);
      } catch (error) {
        console.error("Error in chunk upload process:", error);
        setError("Error during chunk upload process");
      }
    },
    [id, supabase]
  );

  const handleDeviceChange = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputDevices = devices.filter(
        (device) => device.kind === "audioinput"
      );

      console.log("Available audio devices:", audioInputDevices);
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
        },
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      let chunkIndex = 0;

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          console.log("Data chunk received:", event.data.size);
          await uploadChunkToSupabase(event.data, chunkIndex++);
        }
      };

      recorder.start(1000); // Collect data every second
      setMediaRecorder(recorder);
      setIsRecording(true);
      setError(null);
      console.log("Recording started");
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
      console.log("Recording stopped");
    }
  }, [mediaRecorder]);

  const handleRecord = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <main className="flex flex-col items-center justify-center h-dvh pt-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {roomOwnerUsername === currentUsername && (
        <h3 className="text-white bg-red-600 p-1 m-1 text-sm rounded-lg border-2 border-black">
          <button onClick={handleRecord}>
            {isRecording ? "Stop Recording" : "Start Recording"}
          </button>
        </h3>
      )}
      <div className="flex flex-col text-center text-pretty items-center justify-center p-4 rounded-lg bg-gray-700">
        <div className="z-10 hover:text-realGreen text-white transition-all duration-200">
          <Link href="/">FRIQUENCY RADIO</Link>
        </div>
        <div className="text-2xl text-blue-500">
          📡{" "}
          <span className="text-pink-400 hover:text-pink-600 cursor-pointer transition-all duration-200">
            {room?.name}
          </span>{" "}
          📡
        </div>
        <p className="text-green-500 text-sm">
          Curated by:{" "}
          <span className="font-bold">
            {"@" + (roomOwnerUsername || "Unknown")}
          </span>
        </p>
        <div className="p-2 hover:opacity-75">
          <CopyURL />
        </div>
      </div>
      <audio ref={audioRef} autoPlay muted={currentUsername === roomOwnerUsername} />
      <div>
        <label htmlFor="audioDevices" className="text-white">
          Select Audio Input Device:
        </label>
        <select
          id="audioDevices"
          value={selectedDeviceId || ""}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
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
      </div>
      <ChatContainer id={id} />
    </main>
  );
};

export default RoomPage;