"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteAccount(userId: string) {
  const supabase = createClient();

  // Delete user from Supabase Auth
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Error deleting user from auth:", authError);
    throw authError;
  }

  // Delete user from the 'users' table
  const { error: dbError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (dbError) {
    console.error("Error deleting user from the 'users' table:", dbError);
    throw dbError;
  }

  console.log("User account and associated data deleted successfully.");
}
