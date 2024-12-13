import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const DeleteRoom = async (roomId: string): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No authenticated user");
      return false;
    }

    const { data: roomCheck, error: roomCheckError } = await supabase
      .from("rooms")
      .select("created_by")
      .eq("id", roomId)
      .eq("created_by", user.id)
      .single();

    if (roomCheckError || !roomCheck) {
      console.error("Room not found or not owned by user", roomCheckError);
      return false;
    }

    const { error } = await supabase.from("rooms").delete().eq("id", roomId);

    if (error) {
      console.error("Error deleting room from database:", error.message);
      return false;
    }

    console.log("Room deleted from database:", roomId);
    return true;
  } catch (err) {
    console.error("Unexpected error occurred during deletion:", err);
    return false;
  }
};
