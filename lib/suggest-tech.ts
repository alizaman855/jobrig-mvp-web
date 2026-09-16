export type TechCandidate = {
  id: string;
  name: string;
  serviceZone: string | null;
  /** ISO date strings (YYYY-MM-DD) this tech already has a job scheduled on. */
  scheduledDates: string[];
};

export type TechSuggestion = {
  techId: string;
  name: string;
  zoneMatch: boolean;
  jobsThatDay: number;
  reason: string;
};

/**
 * Ranks techs for a job by (1) whether their service zone appears in the
 * job's address text, then (2) fewer jobs already on the candidate date.
 * No live GPS or routing — this is the doc's explicit MVP simplification.
 *
 * Deliberately does not claim a specific free time (e.g. "free at 2pm"):
 * Job has no duration/end time, so "next open slot" would be fabricated
 * precision. Availability is expressed as a job count on the day instead.
 */
export function suggestTech(
  jobAddress: string,
  candidateDateIso: string | null,
  techs: TechCandidate[]
): TechSuggestion[] {
  const addressLower = jobAddress.toLowerCase();

  return techs
    .map((tech) => {
      const zoneMatch = Boolean(
        tech.serviceZone && addressLower.includes(tech.serviceZone.toLowerCase())
      );
      const jobsThatDay = candidateDateIso
        ? tech.scheduledDates.filter((d) => d === candidateDateIso).length
        : 0;

      const zonePart = tech.serviceZone
        ? zoneMatch
          ? `Matches ${tech.serviceZone} service zone`
          : `Zone: ${tech.serviceZone} (no match)`
        : "No service zone set";

      const availPart = !candidateDateIso
        ? "no date selected yet"
        : jobsThatDay === 0
          ? "no jobs scheduled that day"
          : `${jobsThatDay} job${jobsThatDay === 1 ? "" : "s"} already scheduled that day`;

      return {
        techId: tech.id,
        name: tech.name,
        zoneMatch,
        jobsThatDay,
        reason: `${zonePart} · ${availPart}`,
      };
    })
    .sort((a, b) => {
      if (a.zoneMatch !== b.zoneMatch) return a.zoneMatch ? -1 : 1;
      return a.jobsThatDay - b.jobsThatDay;
    });
}
