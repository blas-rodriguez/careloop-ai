"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }
  return (
    <button
      onClick={() => void logout()}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-emerald-50/65 hover:bg-white/7 hover:text-white"
    >
      <LogOut size={18} />
      Sign out
    </button>
  );
}
