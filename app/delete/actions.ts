"use server";

import { createClient } from "@/utils/supabase/server";

export async function deleteAccount(userId: string) {
  const supabase = createClient();

  // Delete user from Supabase Auth
  const { data: authData } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("users")
    .select("username")
    .eq("id", authData.user?.id)
    .single();

  const { error: authError } = await supabase.auth.admin.deleteUser(userId);

  if (authError) {
    console.error("Error deleting user from auth:", authError);
    throw authError;
  }

  // Delete user from the 'users' table
  const storedData = profileData?.username;
  console.log("Username to be deleted:", storedData);

  const { error: dbError } = await supabase
    .from("users")
    .delete()
    .eq("id", userId);

  if (dbError) {
    console.error("Error deleting user from the 'users' table:", dbError);
    throw dbError;
  }

  // Log successful deletion
  console.log("---------");
  console.log(
    `${storedData}` + ` has been successfully deleted!`.toUpperCase()
  );
  console.log("---------");
}
