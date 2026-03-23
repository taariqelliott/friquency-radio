"use client";

import { Modal, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createRoom } from "../rooms/all/actions";

export default function CreateRoom() {
  const [opened, { open, close }] = useDisclosure(false);
  const [name, setName] = useState("");
  const router = useRouter();

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
        setName("");
        close();
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
        className="app-action-secondary mt-4 w-[200px] max-w-xs"
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
          <button
            type="submit"
            className="app-action-primary mt-4 w-full max-w-xs"
          >
            Create Station
          </button>
        </form>
      </Modal>
    </div>
  );
}
