"use server";

import { createAdminClient } from "@/utils/supabase/admin";

export async function deleteAccount(userId: string) {
  const adminSupabase = createAdminClient();

  const { error: authError } = await adminSupabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Error deleting user from auth:", authError);
    throw authError;
  }

  // Delete user from the 'users' table
  const { error: dbError } = await adminSupabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (dbError) {
    console.error("Error deleting user from the 'users' table:", dbError);
    throw dbError;
  }
}
