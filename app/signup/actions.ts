"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

async function addUserToTable(
  supabase: any,
  userId: string,
  email: string,
  username: string
) {
  const { error } = await supabase.from("users").insert({
    id: userId,
    email,
    username,
  });

  if (error) {
    throw error;
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const username = formData.get("username") as string;

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    redirect("/error");
  } else if (authData.user?.id) {
    await addUserToTable(supabase, authData.user.id, email, username);
    revalidatePath("/");
    redirect("/");
  }
}
