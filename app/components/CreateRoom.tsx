"use client";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createRoom } from "../rooms/all/actions";

export default function CreateRoom() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters.");
      return;
    }
    if (name.length > 26) {
      setError("Name must be 26 characters or fewer.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    try {
      const result = await createRoom(formData);
      if ("roomId" in result) {
        setOpen(false);
        setName("");
        router.push(`/rooms/${result.roomId}`);
      } else if ("error" in result) {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        className="mt-4 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
      >
        Create Station
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a Station</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="station-name" className="text-sm font-medium">
                Station name
              </label>
              <Input
                id="station-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Late Night Jazz"
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Station</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
