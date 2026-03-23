"use client";

import { createClient } from "@/utils/supabase/client";
import { IconMusic, IconTrash, IconUpload } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useRef, useState } from "react";

const AUDIO_BUCKET = "room-audio";
const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024;
const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg",
  "audio/mp4",
  "audio/x-m4a",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
];
const ACCEPTED_AUDIO_EXTENSIONS = [".mp3", ".m4a", ".wav"];

interface RoomAudioPlayerProps {
  room: {
    id: string;
    name: string;
    created_by: string;
    audio_path: string | null;
    audio_title: string | null;
    audio_mime_type: string | null;
    audio_size_bytes: number | string | null;
  };
  isRoomOwner: boolean;
}

function formatFileSize(size: number | string | null) {
  if (!size) return null;

  const numericSize = typeof size === "string" ? Number(size) : size;

  if (!Number.isFinite(numericSize) || numericSize <= 0) {
    return null;
  }

  if (numericSize < 1024 * 1024) {
    return `${Math.round(numericSize / 1024)} KB`;
  }

  return `${(numericSize / (1024 * 1024)).toFixed(1)} MB`;
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^\w.-]/g, "_");
}

function getNormalizedMimeType(file: File) {
  if (ACCEPTED_AUDIO_TYPES.includes(file.type)) {
    return file.type;
  }

  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".mp3")) {
    return "audio/mpeg";
  }

  if (lowerName.endsWith(".m4a")) {
    return "audio/mp4";
  }

  if (lowerName.endsWith(".wav")) {
    return "audio/wav";
  }

  return null;
}

export default function RoomAudioPlayer({
  room,
  isRoomOwner,
}: RoomAudioPlayerProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [supabase] = useState(() => createClient());
  const [audioPath, setAudioPath] = useState(room.audio_path);
  const [audioTitle, setAudioTitle] = useState(room.audio_title);
  const [audioMimeType, setAudioMimeType] = useState(room.audio_mime_type);
  const [audioSizeBytes, setAudioSizeBytes] = useState(room.audio_size_bytes);
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const audioUrl = audioPath
    ? supabase.storage.from(AUDIO_BUCKET).getPublicUrl(audioPath).data.publicUrl
    : null;

  const handleFileSelection = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    const mimeType = getNormalizedMimeType(file);

    if (!mimeType) {
      setErrorMessage("Only MP3, M4A, and WAV files are supported.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AUDIO_FILE_SIZE) {
      setErrorMessage("Audio files must be 50MB or smaller.");
      event.target.value = "";
      return;
    }

    setIsBusy(true);

    const uploadedAudioPath = `${room.id}/${Date.now()}-${sanitizeFileName(
      file.name
    )}`;
    const previousAudioPath = audioPath;

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .upload(uploadedAudioPath, file, {
          contentType: mimeType,
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { error: roomUpdateError } = await supabase
        .from("rooms")
        .update({
          audio_path: uploadData.path,
          audio_title: file.name,
          audio_mime_type: mimeType,
          audio_size_bytes: file.size,
        })
        .eq("id", room.id)
        .eq("created_by", room.created_by);

      if (roomUpdateError) {
        await supabase.storage.from(AUDIO_BUCKET).remove([uploadData.path]);
        throw roomUpdateError;
      }

      setAudioPath(uploadData.path);
      setAudioTitle(file.name);
      setAudioMimeType(mimeType);
      setAudioSizeBytes(file.size);
      setStatusMessage(previousAudioPath ? "Audio replaced." : "Audio uploaded.");

      if (previousAudioPath && previousAudioPath !== uploadData.path) {
        const { error: removeError } = await supabase.storage
          .from(AUDIO_BUCKET)
          .remove([previousAudioPath]);

        if (removeError) {
          console.error("Error cleaning up previous audio file:", removeError);
        }
      }

      router.refresh();
    } catch (error) {
      console.error("Error uploading room audio:", error);
      setErrorMessage("Upload failed. Check your Supabase bucket and policies.");
    } finally {
      setIsBusy(false);
      event.target.value = "";
    }
  };

  const handleDeleteAudio = async () => {
    if (!audioPath) {
      return;
    }

    setIsBusy(true);
    setStatusMessage(null);
    setErrorMessage(null);

    const pathToDelete = audioPath;

    try {
      const { error: roomUpdateError } = await supabase
        .from("rooms")
        .update({
          audio_path: null,
          audio_title: null,
          audio_mime_type: null,
          audio_size_bytes: null,
        })
        .eq("id", room.id)
        .eq("created_by", room.created_by);

      if (roomUpdateError) {
        throw roomUpdateError;
      }

      setAudioPath(null);
      setAudioTitle(null);
      setAudioMimeType(null);
      setAudioSizeBytes(null);

      const { error: deleteError } = await supabase.storage
        .from(AUDIO_BUCKET)
        .remove([pathToDelete]);

      if (deleteError) {
        console.error("Error deleting room audio from storage:", deleteError);
        setStatusMessage("Audio removed from the room. Storage cleanup failed.");
      } else {
        setStatusMessage("Audio removed.");
      }

      router.refresh();
    } catch (error) {
      console.error("Error removing room audio:", error);
      setErrorMessage("Delete failed. Check your Supabase policies.");
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <section className="w-[97%] max-w-screen-lg mt-6 rounded-xl border border-stone-600 bg-stone-800/80 p-4">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-blue-400">
              <IconMusic size={18} />
              <span className="text-sm uppercase tracking-[0.2em]">
                Station Audio
              </span>
            </div>
            <h2 className="mt-1 text-xl font-bold text-white">
              {audioTitle || "No audio uploaded yet"}
            </h2>
            <p className="text-sm text-stone-300">
              {audioPath
                ? "Playback is local to your browser. Everyone controls their own player."
                : "This station is public, but the creator still needs to upload a track."}
            </p>
            {audioPath && (
              <p className="mt-1 text-xs text-stone-400">
                {audioMimeType || "audio file"}
                {audioSizeBytes ? ` • ${formatFileSize(audioSizeBytes)}` : ""}
              </p>
            )}
          </div>

          {isRoomOwner && (
            <div className="flex flex-col gap-2 md:items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept={`${ACCEPTED_AUDIO_EXTENSIONS.join(",")},${ACCEPTED_AUDIO_TYPES.join(",")}`}
                className="hidden"
                onChange={handleFileSelection}
                disabled={isBusy}
              />
              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-lg border border-blue-500 bg-black px-4 py-2 font-bold text-lime-500 transition-all duration-200 hover:bg-lime-500 hover:text-black disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => fileInputRef.current?.click()}
                disabled={isBusy}
              >
                <IconUpload size={16} />
                {audioPath ? "Replace Audio" : "Upload Audio"}
              </button>
              {audioPath && (
                <button
                  type="button"
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-500 bg-black px-4 py-2 font-bold text-red-400 transition-all duration-200 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={handleDeleteAudio}
                  disabled={isBusy}
                >
                  <IconTrash size={16} />
                  Remove Audio
                </button>
              )}
              <p className="text-right text-xs text-stone-400">
                MP3, M4A, WAV
                <br />
                Max 50MB
              </p>
            </div>
          )}
        </div>

        {audioUrl ? (
          <audio
            key={audioUrl}
            controls
            preload="metadata"
            className="w-full"
            src={audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
        ) : (
          <div className="rounded-lg border border-dashed border-stone-500 bg-black/30 px-4 py-6 text-center text-stone-400">
            {isRoomOwner
              ? `Upload a track for ${room.name} to make this station playable.`
              : `${room.name} does not have audio yet.`}
          </div>
        )}

        {(statusMessage || errorMessage || isRoomOwner) && (
          <div className="flex flex-col gap-1 text-sm">
            {statusMessage && <p className="text-lime-400">{statusMessage}</p>}
            {errorMessage && <p className="text-red-400">{errorMessage}</p>}
            {isRoomOwner && !errorMessage && (
              <p className="text-stone-400">
                Uploads are public. Anyone can listen once a file is attached to this room.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
