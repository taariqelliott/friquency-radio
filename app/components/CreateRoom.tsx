"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom } from "../rooms/all/actions";
import { TextInput, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

export default function CreateRoom() {
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (name.length > 26) {
      alert("Name is too long!");
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
        router.push(`/rooms/${result.roomId}`);
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
        className="mt-4 text-green-500 text-center border border-green-500 w-full max-w-xs hover:bg-green-500 hover:text-white font-bold py-2 px-4 rounded"
      >
        Create Room
      </button>
      <Modal opened={opened} onClose={close} title="Create Room" centered>
        <form onSubmit={handleSubmit} className="flex flex-col items-center ">
          <label htmlFor="name" className="block w-full mb-2">
            Room name:
            <TextInput
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>
          <button
            type="submit"
            className="mt-4 text-green-500 text-center border border-green-500 w-full max-w-xs hover:bg-green-500 hover:text-white font-bold py-2 px-4 rounded"
          >
            Add Room
          </button>
        </form>
      </Modal>
    </div>
  );
}
