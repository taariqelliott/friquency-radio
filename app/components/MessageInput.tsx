import { createClient } from "@/utils/supabase/client";
import { Input } from "@mantine/core";
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

  const onSubmit = async (data: ChatInputForm) => {
    try {
      if (data.message_text.trim() === "") {
        alert("Field cannot be empty");
        reset();
        focus();
        return;
      }
      const { error } = await supabase.from("chat").insert({
        message_text: data.message_text,
        room_id,
        user_id,
      });

      if (error) {
        console.error("Error inserting message:", error);
      } else {
        reset();
        console.log("Message inserted successfully");
      }
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <form
      className="flex items-center bg-gray-800 border border-gray-600 rounded-lg shadow-md p-2"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input
        type="text"
        className="flex-grow bg-gray-900 text-sm rounded-lg p-1 mr-2 text-gray-200"
        placeholder="Type your message here"
        {...register("message_text", { required: true })}
      />
      <button
        className="text-white bg-pink-500 hover:bg-pink-600 hover:text-black focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-4 py-2 transition duration-200 ease-in-out"
        type="submit"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;
