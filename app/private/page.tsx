import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function PrivatePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  console.log(data.user);

  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center h-dvh">
      <p>Hello {data.user.email}</p>
      <p>id: {data.user.id}</p>
      <p>Created at: {data.user.created_at}</p>
    </div>
  );
}
