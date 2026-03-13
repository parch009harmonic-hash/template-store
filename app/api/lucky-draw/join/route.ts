import { NextResponse } from "next/server";

import { getRequestId, logger } from "@/lib/logger";
import { getApiUser } from "@/lib/supabase/api";
import { joinLuckyDrawCampaign } from "@/lib/supabase/crud/lucky-draw";
import { luckyDrawJoinSchema } from "@/lib/validation/lucky-draw";

function mapJoinError(message: string) {
  if (message.includes("Entry limit exceeded")) return "You have reached your entry limit for this campaign.";
  if (message.includes("quota reached")) return "This campaign has reached its entry quota.";
  if (message.includes("Insufficient points")) return "You do not have enough points to join this campaign.";
  if (message.includes("Membership tier")) return "Your membership tier does not meet this campaign requirement.";
  if (message.includes("Membership status")) return "Your membership is not active for this campaign.";
  if (message.includes("Active membership is required")) return "Please activate membership before joining.";
  if (message.includes("inactive")) return "This campaign is currently inactive.";
  if (message.includes("date range")) return "This campaign is outside its active period.";
  return message || "Unable to join lucky draw campaign";
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const auth = await getApiUser();
    if (auth.error || !auth.user) {
      logger.warn("lucky_draw.join.unauthorized", { requestId });
      return auth.error;
    }

    const body = await request.json();
    const parsed = luckyDrawJoinSchema.safeParse(body);
    if (!parsed.success) {
      logger.warn("lucky_draw.join.invalid_payload", {
        requestId,
        profileId: auth.user.id,
        details: parsed.error.flatten()
      });
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { data, error } = await joinLuckyDrawCampaign(
      auth.supabase,
      auth.user.id,
      parsed.data.campaignId
    );

    if (error) {
      logger.warn("lucky_draw.join.rejected", {
        requestId,
        profileId: auth.user.id,
        campaignId: parsed.data.campaignId,
        error: error.message
      });
      return NextResponse.json(
        { error: mapJoinError(error.message ?? "") },
        { status: 400 }
      );
    }

    logger.info("lucky_draw.join.success", {
      requestId,
      profileId: auth.user.id,
      campaignId: parsed.data.campaignId
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    logger.error("lucky_draw.join.exception", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error"
    });
    return NextResponse.json({ error: "Unable to process lucky draw join request" }, { status: 500 });
  }
}
