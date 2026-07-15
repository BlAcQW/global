import { readConfig } from "@/lib/globe-config";
import { SeminarStage } from "./seminar-stage";

// Re-read the admin config on every request so saved changes appear immediately.
export const dynamic = "force-dynamic";

/** Landing page: the live-seminar globe, full-bleed. Configured via /admin. */
export default async function LandingPage() {
  const config = await readConfig();
  return (
    <main className="h-screen w-screen overflow-hidden bg-[radial-gradient(120%_120%_at_50%_0%,#f3f5f9_0%,#dfe4ec_100%)]">
      <SeminarStage config={config} />
    </main>
  );
}
