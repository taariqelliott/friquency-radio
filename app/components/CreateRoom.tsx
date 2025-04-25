"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "../rooms/all/actions";
import { TextInput, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { createClient } from "@/utils/supabase/client";

export default function CreateRoom() {
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");
  const [twitchUsername, setTwitchUsername] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (name.length > 26) {
      alert("Name is too long!");
      setName("");
      return;
    }

    if (name.trim().length === 0) {
      alert("Name cannot be empty!");
      setName("");
      return;
    }

    if (name.length < 3) {
      alert("Name is too short!");
      setName("");
      return;
    }

    if (!name) {
      alert("Room name is required!");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);

    try {
      const result = await createRoom(formData);
      if ("roomId" in result) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from("users")
            .update({ twitchUsername })
            .eq("id", user.id);

          if (error) {
            console.error("Error updating Twitch username:", error);
            alert(`Failed to update Twitch username: ${error.message}`);
          } else {
            router.push(`/rooms/${result.roomId}`);
          }
        } else {
          alert("User not authenticated");
        }
      } else if ("error" in result) {
        console.error("Error creating room:", result.error);
        alert(`Failed to create room: ${result.error}`);
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("An unexpected error occurred while creating the room.");
    }
  };

  return (
    <div>
      <button
        onClick={open}
        className="mt-4 transition duration-200 text-green-500 text-center bg-black border border-pink-500 w-[200px] max-w-xs hover:bg-green-500 hover:text-black font-bold py-2 px-4 rounded"
      >
        Create Station
      </button>
      <Modal opened={opened} onClose={close} title="Create Room" centered>
        <form onSubmit={handleSubmit} className="flex flex-col items-center ">
          <label htmlFor="name" className="block w-full mb-2">
            Station name:
            <TextInput
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <label htmlFor="twitchUsername" className="block w-full mb-2">
            Twitch Username:
            <TextInput
              id="twitchUsername"
              name="twitchUsername"
              type="text"
              required
              value={twitchUsername}
              onChange={(event) => setTwitchUsername(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="mt-4 text-green-500 text-center border border-green-500 w-full max-w-xs hover:bg-green-500 hover:text-white font-bold py-2 px-4 rounded"
          >
            Create Station
          </button>
        </form>
      </Modal>
    </div>
  );
}
