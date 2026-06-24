"use client";

import { createClient } from "@/utils/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconUpload,
  IconTrash,
  IconMusic,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

interface PlayerRoom {
  id: string;
  name: string;
  created_by: string;
  audio_url: string | null;
  audio_filename: string | null;
}

interface PlayerCardProps {
  room: PlayerRoom;
  isOwner: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function PlayerCard({ room, isOwner }: PlayerCardProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(room.audio_url);
  const [audioFilename, setAudioFilename] = useState<string | null>(room.audio_filename);
  const [uploading, setUploading] = useState(false);
  const [fileSize, setFileSize] = useState<string | null>(null);

  useEffect(() => {
    const channel = supabase
      .channel(`room:${room.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "rooms",
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updated = payload.new as PlayerRoom;
          setAudioUrl(updated.audio_url);
          setAudioFilename(updated.audio_filename);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase, room.id]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);

    try {
      const sanitized = file.name.trim().replace(/[^\w.\-]/g, "_");
      const path = `${room.id}/${Date.now()}-${sanitized}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("room-audio")
        .upload(path, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("room-audio")
        .getPublicUrl(uploadData.path);

      await supabase
        .from("rooms")
        .update({
          audio_url: urlData.publicUrl,
          audio_filename: file.name,
        })
        .eq("id", room.id);

      setFileSize(formatBytes(file.size));
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    await supabase
      .from("rooms")
      .update({ audio_url: null, audio_filename: null })
      .eq("id", room.id);
  };

  return (
    <Card className="rounded-none border-x-0 border-t-0 border-b border-border animate-in fade-in duration-300">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
              <IconMusic size={12} /> Station Audio
            </p>
            <h2 className="font-display text-3xl mt-1 truncate text-foreground leading-none">
              {room.name}
            </h2>
            {audioFilename && (
              <p className="font-mono text-xs text-muted-foreground mt-1 truncate">
                {audioFilename}
                {fileSize && ` • ${fileSize}`}
              </p>
            )}
            {!audioUrl && (
              <p className="text-xs text-muted-foreground mt-1">
                No audio uploaded yet.
              </p>
            )}
          </div>

          {isOwner && (
            <div className="flex shrink-0 flex-col gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".mp3,.m4a,.wav,audio/mpeg,audio/mp4,audio/x-m4a,audio/wav"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="app-action-primary flex items-center gap-2 text-sm px-3 py-1.5 disabled:opacity-50"
              >
                <IconUpload size={14} />
                {uploading ? "Uploading..." : audioUrl ? "Replace Audio" : "Upload Audio"}
              </button>
              {audioUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="app-action-danger flex items-center gap-2 text-sm px-3 py-1.5"
                >
                  <IconTrash size={14} /> Remove Audio
                </button>
              )}
              <p className="text-xs text-muted-foreground text-right">
                MP3, M4A, WAV · Max 50MB
              </p>
            </div>
          )}
        </div>

        {audioUrl && (
          <audio
            controls
            preload="metadata"
            className="w-full"
            src={audioUrl}
            key={audioUrl}
          >
            Your browser does not support the audio element.
          </audio>
        )}
      </CardContent>
    </Card>
  );
}
