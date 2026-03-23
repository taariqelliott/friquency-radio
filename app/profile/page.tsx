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
    <main className="app-page app-page-center">
      <div className="app-shell-narrow">
        <section className="app-panel space-y-3 text-center">
          <div className="app-kicker">Profile</div>
          <h1 className="text-3xl font-bold tracking-tight">
            {(authData.user?.is_anonymous && `Hello ${profileData?.username}`) ||
              `Hello ${authData.user.email}`}
          </h1>
          <p className="app-copy">
            Username: {profileData?.username || "No username set"}
          </p>
          <p className="app-muted text-sm">ID: {authData.user.id}</p>
          <p className="app-muted text-sm">
            Created at: {authData.user.created_at}
          </p>
        </section>
      </div>
    </main>
  );
}
