import { z } from "zod";

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128)
});

export const customerRegisterSchema = customerLoginSchema.extend({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20)
});

export const adminLoginSchema = customerLoginSchema;
