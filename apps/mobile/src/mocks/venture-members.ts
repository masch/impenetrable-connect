import { MOCK_VENTURE_MEMBERS } from "./venture-members.data";

/**
 * Get venture IDs assigned to a specific user
 */
export function getVentureIdsByUserId(userId: string): number[] {
  return MOCK_VENTURE_MEMBERS.filter((m) => m.userId === userId).map((m) => m.ventureId);
}

/**
 * Check if a user has access to a specific venture
 */
export function userHasVentureAccess(userId: string, ventureId: number): boolean {
  return MOCK_VENTURE_MEMBERS.some((m) => m.userId === userId && m.ventureId === ventureId);
}
