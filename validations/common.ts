import { z } from "zod";

export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const dateRangeSchema = z
  .object({
    startsAt: z.string().datetime({ offset: true }),
    endsAt: z.string().datetime({ offset: true })
  })
  .superRefine((payload, ctx) => {
    if (new Date(payload.endsAt).getTime() <= new Date(payload.startsAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt"
      });
    }
  });
