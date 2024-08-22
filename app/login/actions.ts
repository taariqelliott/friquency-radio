"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

async function addUserToTable(
  supabase: any,
  userId: string,
  email: string | null
) {
  const { error } = await supabase.from("users").upsert(
    [
      {
        id: userId,
        email: email || null,
      },
    ],
    { onConflict: ["id"] }
  );

  if (error) {
    console.error("Error inserting/updating user:", error);
    throw error;
  }
}

export async function login(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    redirect("/error");
  } else {
    await addUserToTable(supabase, authData.user.id, data.email || null);
    revalidatePath("/", "layout");
    redirect("/");
  }
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: authData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  } else if (authData.user?.id) {
    await addUserToTable(supabase, authData.user.id, data.email || null);
    revalidatePath("/", "layout");
    redirect("/");
  }
}

export async function anonymousSignIn() {
  const supabase = createClient();
  const { data: authData, error } = await supabase.auth.signInAnonymously();

  if (error) {
    redirect("/error");
  } else if (authData.user?.id) {
    await addUserToTable(supabase, authData.user.id, null);
    revalidatePath("/", "layout");
    redirect("/");
  }
}
