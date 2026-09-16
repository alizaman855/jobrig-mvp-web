import "server-only";
import { forTenant } from "@/lib/tenant";
import type { TechCandidate } from "@/lib/suggest-tech";

/**
 * Techs plus the dates (YYYY-MM-DD) they already have a job scheduled on —
 * everything suggestTech() needs, minus the job's own address/date which
 * the form only knows once the tech/dispatcher starts filling it in.
 */
export async function getTechCandidates(
  businessId: string,
  excludeJobId?: string
): Promise<TechCandidate[]> {
  const db = forTenant({ businessId });

  const [techs, jobs] = await Promise.all([
    db.user.findMany({ where: { role: "TECH" }, orderBy: { name: "asc" } }),
    db.job.findMany({
      where: {
        assignedTechId: { not: null },
        scheduledAt: { not: null },
        ...(excludeJobId ? { id: { not: excludeJobId } } : {}),
      },
      select: { assignedTechId: true, scheduledAt: true },
    }),
  ]);

  const datesByTech = new Map<string, string[]>();
  for (const job of jobs) {
    if (!job.assignedTechId || !job.scheduledAt) continue;
    const iso = job.scheduledAt.toISOString().slice(0, 10);
    const list = datesByTech.get(job.assignedTechId) ?? [];
    list.push(iso);
    datesByTech.set(job.assignedTechId, list);
  }

  return techs.map((tech) => ({
    id: tech.id,
    name: tech.name,
    serviceZone: tech.serviceZone,
    scheduledDates: datesByTech.get(tech.id) ?? [],
  }));
}
