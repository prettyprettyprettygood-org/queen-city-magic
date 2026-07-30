export const FESTIVAL_START = "2026-11-26T00:00:00";
export const FESTIVAL_END = "2026-11-27T00:00:00";
export const MS_PER_DAY = 1000 * 60 * 60 * 24;

export type FestivalStatus = "upcoming" | "live" | "past";

export function festivalStatus(now = Date.now()): FestivalStatus {
  if (now < new Date(FESTIVAL_START).getTime()) return "upcoming";
  if (now < new Date(FESTIVAL_END).getTime()) return "live";
  return "past";
}

export function daysUntilFestival(now = Date.now()): number {
  return Math.max(
    Math.ceil((new Date(FESTIVAL_START).getTime() - now) / MS_PER_DAY),
    0,
  );
}
