import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const supabase = createClient();

  // Get user authentication data
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData?.user) {
    // Redirect to home if no user is logged in
    redirect("/");
  }

  // Fetch the user's profile data
  const { data: profileData, error: profileError } = await supabase
    .from("users")
    .select("username")
    .eq("id", authData.user.id)
    .single();

  if (profileError) {
    console.error("Error fetching profile:", profileError.message);
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      {(authData.user?.is_anonymous && (
        <p>Hello {profileData?.username}</p>
      )) || <div>Hello {authData.user.email}</div>}
      <p>Username: {profileData?.username || "No username set"}</p>
      <p>ID: {authData.user.id}</p>
      <p>Created at: {authData.user.created_at}</p>
    </div>
  );
}
