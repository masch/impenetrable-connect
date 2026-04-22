import { z } from "zod";
import { UserRoleSchema } from "./common";

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  alias: z.string().max(50).nullable(),
  firstName: z.string().max(100).nullable(),
  lastName: z.string().max(100).nullable(),
  phoneNumber: z.string().max(20).nullable(),
  role: UserRoleSchema,
  zzz_failed_login_attempts: z.number().int().default(0),
  zzz_last_login_at: z.date().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof UserSchema>;

export const CreateUserInputSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  zzz_failed_login_attempts: true,
  zzz_last_login_at: true,
  isActive: true,
});

export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

export const LoginInputSchema = z.union([
  z.object({
    email: z.string().email(),
    password: z.string().min(8),
  }),
  z.object({
    alias: z.string().min(1),
  }),
]);

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const AuthResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  user: UserSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
