import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getUserProfile, upsertUserProfile } from "@/lib/db/queries";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await getUserProfile(session.user.id);
  return NextResponse.json({ profile });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { phone, height, age, activityLevel, preferredUnit } = body;

  await upsertUserProfile(session.user.id, {
    phone: phone || undefined,
    height: height || undefined,
    age: age || undefined,
    activityLevel: activityLevel || undefined,
    preferredUnit: preferredUnit || undefined,
  });

  return NextResponse.json({ success: true });
}
