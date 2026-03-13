import { z } from "zod";

const dateIsoString = z.string().datetime({ offset: true });

const promoCampaignBaseSchema = z.object({
  restaurantId: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional().nullable(),
  discountType: z.enum(["percentage", "fixed_amount", "free_item"]),
  discountValue: z.number().min(0),
  startsAt: dateIsoString,
  endsAt: dateIsoString,
  isActive: z.boolean().default(false)
});

export const promoCampaignCreateSchema = promoCampaignBaseSchema
  .superRefine((payload, ctx) => {
    if (new Date(payload.endsAt).getTime() <= new Date(payload.startsAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt"
      });
    }
  });

export const promoCampaignUpdateSchema = promoCampaignBaseSchema
  .partial()
  .extend({
    restaurantId: z.string().uuid()
  })
  .superRefine((payload, ctx) => {
    if (!payload.startsAt || !payload.endsAt) return;
    if (new Date(payload.endsAt).getTime() <= new Date(payload.startsAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt"
      });
    }
  });
