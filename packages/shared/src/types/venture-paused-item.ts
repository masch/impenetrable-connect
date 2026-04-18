import { z } from "zod";

/**
 * VenturePausedItemSchema
 * Intermediate entity (junction table) to manage which catalog items
 * are currently unavailable for a specific venture.
 */
export const VenturePausedItemSchema = z.object({
  id: z.number().int().positive(),
  venture_id: z.number().int().positive(),
  catalog_item_id: z.number().int().positive(),
  paused_at: z.date().default(() => new Date()),
  reason: z.string().nullable().optional(),
});

export type VenturePausedItem = z.infer<typeof VenturePausedItemSchema>;
