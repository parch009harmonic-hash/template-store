import { z } from "zod";

const dateIsoString = z.string().datetime({ offset: true });

const luckyDrawCampaignBaseSchema = z.object({
  restaurantId: z.string().uuid(),
  title: z.string().min(3).max(120),
  description: z.string().max(500).optional().nullable(),
  startsAt: dateIsoString,
  endsAt: dateIsoString,
  status: z.enum(["active", "inactive"]).default("inactive"),
  entryCostPoints: z.number().int().min(0).max(100000).default(0),
  maxEntriesPerMember: z.number().int().min(1).max(500).default(1),
  maxTotalEntries: z.number().int().min(1).max(100000).optional().nullable(),
  minMembershipTier: z.enum(["bronze", "silver", "gold", "platinum"]).default("bronze"),
  requiresActiveMembership: z.boolean().default(true)
});

export const luckyDrawCampaignCreateSchema = luckyDrawCampaignBaseSchema
  .superRefine((payload, ctx) => {
    if (new Date(payload.endsAt).getTime() <= new Date(payload.startsAt).getTime()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["endsAt"],
        message: "endsAt must be greater than startsAt"
      });
    }
  });

export const luckyDrawCampaignUpdateSchema = luckyDrawCampaignBaseSchema
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

export const luckyDrawJoinSchema = z.object({
  campaignId: z.string().uuid()
});
