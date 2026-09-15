import { requireRole } from "@/lib/auth-guards";

export default async function TeamPage() {
  await requireRole(["OWNER"]);
  return <div>Team page placeholder — built out in task 2.4.</div>;
}
