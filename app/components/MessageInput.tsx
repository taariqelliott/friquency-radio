import { createClient } from "@/utils/supabase/client";
import { Input, Modal } from "@mantine/core";
import { useForm } from "react-hook-form";
import { useState, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";
import { IconPhotoPlus } from "@tabler/icons-react";

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
  const [messageSendError, setMessageSendError] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
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

  const handleClearImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const formData = { message_text: e.currentTarget.value };
      await onSubmit(formData);
    }
  };

  const onSubmit = async (data: ChatInputForm) => {
    if (data.message_text.trim() === "" && !imageFile) {
      setMessageSendError(true);
      open();
      return;
    }

    setUploading(true);
    let imageUrl = null;

    try {
      if (imageFile) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("chat-images")
          .upload(`images/${Date.now()}_${imageFile.name}`, imageFile);

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
      className="flex items-center bg-gray-800 border border-gray-600 rounded-lg shadow-md p-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <label
        className={`text-white ${
          imageFile
            ? "bg-green-500 hover:bg-green-400"
            : "bg-black hover:bg-gray-700"
        } rounded-full w-[32px] h-[32px] mr-2 cursor-pointer flex items-center justify-center`}
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
            className="h-11 w-11 object-cover rounded mr-2"
            alt=""
          />
          <button
            onClick={handleClearImage}
            className="absolute top-0 right-0 bg-black text-white transition-all duration-200 hover:bg-red-600 rounded-full w-5 h-5 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}

      <Input
        type="text"
        className="flex-grow bg-gray-900 rounded-lg p-1 mr-2 ml-1 text-gray-200"
        placeholder={
          imageFile ? `${imageFile?.name}` : "Type your message here"
        }
        {...register("message_text")}
        onPaste={handlePaste}
        onKeyDown={handleKeyPress}
      />
      <button
        className="text-white bg-pink-500 hover:bg-pink-600 hover:text-black focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 transition duration-200 ease-in-out"
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
