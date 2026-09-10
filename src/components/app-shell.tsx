import { Activity, Search } from "lucide-react";
import { DesktopSidebar, MobileMenu } from "@/components/app-navigation";
import {
  getCurrentProfile,
  getEnvironmentStatus,
} from "@/lib/data/workspace";

export async function AppShell({
  children,
  active = "Dashboard",
}: {
  children: React.ReactNode;
  active?: string;
}) {
  const account = await getCurrentProfile();
  const environment = getEnvironmentStatus();
  const liveReady =
    environment.provider === "call-e" &&
    environment.callEKey &&
    environment.webhookAdmin;
  const profile = {
    name: account?.name ?? "Clinic user",
    email: account?.email ?? "",
    role: account?.role ?? "coordinator",
  };
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <DesktopSidebar active={active} profile={profile} />
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between gap-3 border-b border-[#dbe5e1] bg-white/90 px-4 backdrop-blur sm:px-5 md:px-8">
          <MobileMenu active={active} profile={profile} />
          <div className="relative hidden w-full max-w-md lg:block">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#788b84]"
              size={17}
            />
            <input
              className="w-full rounded-xl border border-[#dbe5e1] bg-[#f7f9f8] py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-[#58a992] focus:ring-2 focus:ring-[#58a992]/15"
              placeholder="Search patients, calls, appointments..."
            />
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold sm:flex ${liveReady ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${liveReady ? "bg-amber-500" : "bg-emerald-500"}`}
              />
              {liveReady
                ? "Live CALL-E · real calls"
                : environment.provider === "call-e"
                  ? "CALL-E · configuration incomplete"
                  : "Simulation · no real calls"}
            </span>
            <button
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-[#dbe5e1] text-[#52645e]"
            >
              <Activity size={17} />
              <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" />
            </button>
          </div>
        </header>
        <main className="overflow-hidden px-4 py-6 sm:px-5 md:px-8 md:py-8 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
