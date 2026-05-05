import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  role: z.enum(["NormalUser", "Admin"]).optional(),
});
