import { z } from "zod";
import { LanguageSchema } from "./common";

// Schema for input validation
export const TouristSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(8, "Phone number is too short"),
  language: LanguageSchema.default("es"),
  created_at: z.date(),
});

// Infer TypeScript interface directly from the Zod Schema
export interface Tourist extends z.infer<typeof TouristSchema> {}

// Example of a smaller schema for creation (omitting DB-generated fields)
export const CreateTouristSchema = TouristSchema.omit({
  id: true,
  created_at: true,
});

export interface CreateTouristInput extends z.infer<typeof CreateTouristSchema> {}
