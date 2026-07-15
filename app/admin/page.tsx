import { readConfig } from "@/lib/globe-config";
import { AdminDashboard } from "./admin-dashboard";

export const dynamic = "force-dynamic";

/** Admin dashboard (gated by middleware). Loads the current persisted config. */
export default async function AdminPage() {
  const config = await readConfig();
  return <AdminDashboard initialConfig={config} />;
}
