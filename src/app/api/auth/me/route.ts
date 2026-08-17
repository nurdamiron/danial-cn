import { NextResponse } from "next/server";
import { getCurrentUser, publicUser } from "@/lib/auth";

// The body is one specific person's name, phone and email, keyed only by a
// cookie. Next's default for a route handler is `public, max-age=0,
// must-revalidate`, which lets a shared cache store the response and hand it
// to whoever revalidates next.
const PRIVATE_HEADERS = { "Cache-Control": "no-store" };

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { user: null },
      { status: 200, headers: PRIVATE_HEADERS },
    );
  }
  return NextResponse.json(
    { user: publicUser(user) },
    { headers: PRIVATE_HEADERS },
  );
}
