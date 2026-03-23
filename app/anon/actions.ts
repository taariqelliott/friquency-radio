"use server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import randomUserNames from "../components/NameGenerator";

async function addUserToTable(supabase: any, userId: string) {
  const randomName = randomUserNames();

  const { error } = await supabase.from("users").insert({
    id: userId,
    username: randomName,
  });

  if (error) {
    throw error;
  }
}

export async function anonymousSignIn() {
  const supabase = createClient();
  const adminSupabase = createAdminClient();
  const { data: authData, error } = await supabase.auth.signInAnonymously();

  if (error) {
    redirect("/error");
  } else if (authData.user?.id) {
    try {
      await addUserToTable(adminSupabase, authData.user.id);
      revalidatePath("/");
      redirect("/");
    } catch (error) {
      redirect("/error");
    }
  }
}
