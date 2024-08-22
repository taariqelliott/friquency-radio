import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { v4 as uuidv4 } from "uuid";

export default async function PrivatePage() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();
  console.log(data.user);

  if (error || !data?.user) {
    redirect("/login");
  }

  let myuuid = uuidv4();

  return (
    <div>
      <p>Hello {data.user.email}</p>
      <p>id: {data.user.id}</p>
      <p>{data.user.created_at}</p>
      <p>Username: {myuuid}</p>
    </div>
  );
}
