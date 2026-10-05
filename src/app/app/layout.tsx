import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspaceLayout({ children }: LayoutProps<"/app">) {
  if (!hasSupabaseEnv()) redirect("/login?setup=missing");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/login");

  return <AppShell email={data.user.email ?? "Signed in"}>{children}</AppShell>;
}
