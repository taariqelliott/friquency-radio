import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
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
  const { register, handleSubmit, reset } = useForm<ChatInputForm>({
    defaultValues: { message_text: "" },
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearImage = () => {
    setImageFile(null);
    setFileInputKey((k) => k + 1);
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setImageFile(e.target.files?.[0] || null);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) setImageFile(file);
      }
    }
  };

  const handleClearImage = (e: MouseEvent) => {
    e.preventDefault();
    clearImage();
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: ChatInputForm) => {
    if ((data.message_text ?? "").trim() === "" && !imageFile) {
      setValidationError(true);
      setTimeout(() => setValidationError(false), 2000);
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
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage
          .from("chat-images")
          .getPublicUrl(uploadData.path);
        imageUrl = urlData?.publicUrl;
      }

      const { error } = await supabase.from("chat").insert({
        message_text: data.message_text ?? "",
        image_url: imageUrl,
        room_id,
        user_id,
      });

      if (!error) {
        reset({ message_text: "" });
        clearImage();
      }
    } catch (error) {
      console.error("Error in submission:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      {validationError && (
        <p className="text-xs text-destructive px-1">
          Message or image required
        </p>
      )}
      <form
        className="app-card flex items-center gap-2 p-2"
        onSubmit={handleSubmit(onSubmit)}
      >
        <label
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full app-action-secondary px-0"
          title="Upload Image"
        >
          <input
            key={fileInputKey}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
          <IconPhotoPlus className="w-5 h-5" />
        </label>

        {imageFile && (
          <div className="relative flex items-center justify-center">
            <img
              src={URL.createObjectURL(imageFile)}
              className="h-11 w-11 object-cover rounded mr-2"
              alt=""
            />
            <button
              type="button"
              onClick={handleClearImage}
              className="absolute top-0 right-0 bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
            >
              &times;
            </button>
          </div>
        )}

        <Input
          type="text"
          className="flex-grow"
          placeholder={imageFile ? imageFile.name : "Type your message here"}
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
      </form>
    </div>
  );
};

export default ChatInput;
