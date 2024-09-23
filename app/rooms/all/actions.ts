"use server";

import { createClient } from "@/utils/supabase/server";

export async function createRoom(formData: FormData) {
  const supabase = createClient();
  const name = formData.get("name") as string;
  const { data: user, error: userError } = await supabase.auth.getUser();

  if (userError || !user.user) {
    console.error("User error:", userError);
    return { error: "Authentication error" };
  }

  const userId = user.user.id;

  try {
    const { data, error } = await supabase
      .from("rooms")
      .insert({
        name: name,
        created_by: userId,
      })
      .select("id")
      .single();

    if (error) throw error;

    return { roomId: data.id };
  } catch (error) {
    console.error("Error creating room:", error);
    return { error: "Failed to create room" };
  }
}
