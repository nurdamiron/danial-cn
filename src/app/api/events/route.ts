import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hasDatabase } from "@/lib/db-config";
import { clientIp } from "@/lib/rate-limit";
import {
  DEVICES,
  EVENT_TYPES,
  MAX_SLUG_LENGTH,
  MAX_SOURCE_LENGTH,
} from "@/lib/events";

/**
 * Where the storefront reports what a visitor did.
 *
 * Open to the public by necessity — it is called from the shop before anyone
 * signs in — so it stores a closed list of event names and nothing a caller
 * writes for itself. The worst a script can do here is inflate a count.
 */
const schema = z.object({
  type: z.enum(EVENT_TYPES),
  /** Made by the browser; only ever compared with itself. */
  visitId: z.string().min(8).max(64),
  locale: z.enum(["ru", "kk"]).default("ru"),
  slug: z.string().max(MAX_SLUG_LENGTH).optional(),
  source: z.string().max(MAX_SOURCE_LENGTH).optional().default(""),
  device: z.enum(DEVICES).optional(),
});

/** One visitor cannot file more than this in an hour. */
const MAX_EVENTS_PER_IP_PER_HOUR = 600;

/**
 * Analytics must never cost a sale. Every answer is 204: the storefront does
 * not read it, does not retry, and does not show the customer a failure in a
 * feature that exists for the shop's benefit rather than theirs.
 */
const ACCEPTED = new NextResponse(null, { status: 204 });

export async function POST(req: Request) {
  if (!hasDatabase()) return ACCEPTED;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return ACCEPTED;
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) return ACCEPTED;

  try {
    const ip = clientIp(req);
    if (ip) {
      const recent = await prisma.event.count({
        where: {
          visitId: parsed.data.visitId,
          createdAt: { gte: new Date(Date.now() - 3_600_000) },
        },
      });
      if (recent >= MAX_EVENTS_PER_IP_PER_HOUR) return ACCEPTED;
    }

    await prisma.event.create({
      data: {
        type: parsed.data.type,
        visitId: parsed.data.visitId,
        locale: parsed.data.locale,
        slug: parsed.data.slug || null,
        source: parsed.data.source ?? "",
        device: parsed.data.device ?? "",
      },
    });
  } catch {
    // A dashboard that misses a row is a smaller problem than a shop that
    // shows an error because its bookkeeping fell over.
  }

  return ACCEPTED;
}
