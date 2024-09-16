"use server";

import { revalidatePath } from "next/cache";
import { logout } from "./logout/actions";
import { deleteAccount } from "./delete/actions";
import { createClient } from "@/utils/supabase/server";

export async function fetchUser() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error("Error fetching user:", error);
    return null;
  }
  return data;
}

export const handleLogout = async () => {
  try {
    await logout();
    revalidatePath("/", "page");
  } catch (error) {
    console.error("Error logging out:", error);
  }
};

export const handleDeleteAccount = async () => {
  const user = await fetchUser();
  if (user) {
    try {
      await deleteAccount(user.user.id);
      revalidatePath("/", "page");
      window.location.reload();
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  }
};
