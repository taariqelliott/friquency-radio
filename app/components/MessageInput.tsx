import { createClient } from "@/utils/supabase/client";
import { Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPhotoPlus } from "@tabler/icons-react";
import {
  ChangeEvent,
  ClipboardEvent,
  KeyboardEvent,
  MouseEvent,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";

interface ChatInputForm {
  message_text: string;
}

const ChatInput = ({
  room_id,
  user_id,
}: {
  room_id: string;
  user_id: string;
}) => {
  const supabase = createClient();
  const { register, handleSubmit, reset } = useForm<ChatInputForm>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) {
          setImageFile(file);
        }
      }
    }
  };

  const handleClearImage = (e: MouseEvent) => {
    e.preventDefault();
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const formData = { message_text: e.currentTarget.value };
      await onSubmit(formData);
    }
  };

  const onSubmit = async (data: ChatInputForm) => {
    if (data.message_text.trim() === "" && !imageFile) {
      open();
      return;
    }

    setUploading(true);
    let imageUrl = null;

    try {
      if (imageFile) {
        const uploadedImageName = `${new Date().toISOString()}_${imageFile.name
          .trim()
          .replace(/[^\w.-]/g, "_")}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-images")
          .upload(`images/${uploadedImageName}`, imageFile);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("chat-images")
          .getPublicUrl(uploadData.path);

        imageUrl = urlData?.publicUrl;
      }

      const { error } = await supabase.from("chat").insert({
        message_text: data.message_text,
        image_url: imageUrl,
        room_id,
        user_id,
      });

      if (error) {
        console.error("Error inserting message:", error);
      } else {
        console.log("Message inserted successfully");
        reset();
        setImageFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (error) {
      console.error("Error in submission:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      className="app-card flex items-center gap-2 p-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label
        className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full ${
          imageFile
            ? "bg-lime-500 text-black hover:bg-lime-400"
            : "app-action-secondary px-0"
        }`}
        title="Upload Image"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
        <IconPhotoPlus className="w-5 h-5" />
      </label>

      {imageFile && (
        <div className="flex relative items-center justify-center">
          <img
            src={URL.createObjectURL(imageFile)}
            className="mr-2 h-11 w-11 rounded-xl object-cover"
            alt=""
          />
          <button
            onClick={handleClearImage}
            className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-black text-white hover:bg-red-600"
          >
            &times;
          </button>
        </div>
      )}

      <input
        type="text"
        className="app-input flex-grow"
        placeholder={
          imageFile ? `${imageFile?.name}` : "Type your message here"
        }
        {...register("message_text")}
        onPaste={handlePaste}
        onKeyDown={handleKeyPress}
      />
      <button
        className="app-action-primary text-sm"
        type="submit"
        disabled={uploading}
      >
        {uploading ? "Sending..." : "Send"}
      </button>
      <Modal opened={opened} onClose={close} withCloseButton={false} centered>
        <div className="text-red-400 font-bold text-center">
          Message or image required
        </div>
      </Modal>
    </form>
  );
};

export default ChatInput;
