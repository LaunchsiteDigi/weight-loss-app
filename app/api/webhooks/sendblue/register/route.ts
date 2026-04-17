import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Simple auth check
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET ?? "admin"}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SENDBLUE_API_KEY;
  const apiSecret = process.env.SENDBLUE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Sendblue credentials not configured" },
      { status: 500 }
    );
  }

  const webhookUrl = "https://www.slimzer0.com/api/webhooks/sendblue";

  try {
    // Register the webhook with Sendblue
    const response = await fetch("https://api.sendblue.com/api/account/webhooks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "sb-api-key-id": apiKey,
        "sb-api-secret-key": apiSecret,
      },
      body: JSON.stringify({
        webhooks: [webhookUrl],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Failed to register Sendblue webhook:", data);
      return NextResponse.json(
        { error: "Failed to register webhook", details: data },
        { status: response.status }
      );
    }

    console.log("Sendblue webhook registered:", data);
    return NextResponse.json({ success: true, webhookUrl, data });
  } catch (error) {
    console.error("Sendblue webhook registration error:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}

// GET to check current webhooks
export async function GET() {
  const apiKey = process.env.SENDBLUE_API_KEY;
  const apiSecret = process.env.SENDBLUE_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Sendblue credentials not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.sendblue.com/api/account/webhooks", {
      headers: {
        "sb-api-key-id": apiKey,
        "sb-api-secret-key": apiSecret,
      },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 });
  }
}
