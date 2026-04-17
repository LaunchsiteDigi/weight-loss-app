const GHL_API_URL = "https://services.leadconnectorhq.com";

export async function createGHLContact({
  phone,
  name,
  email,
}: {
  phone: string;
  name: string;
  email: string;
}) {
  const apiKey = process.env.GHL_API_KEY;
  const locationId = process.env.GHL_LOCATION_ID;

  if (!apiKey || !locationId) {
    console.warn("GHL API key or location ID not configured, skipping contact creation");
    return null;
  }

  const nameParts = name.trim().split(" ");
  const firstName = nameParts[0] || name;
  const lastName = nameParts.slice(1).join(" ") || "";

  try {
    const response = await fetch(`${GHL_API_URL}/contacts/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Version: "2021-07-28",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        locationId,
        source: "SlimZero Waitlist",
        tags: ["slimzero", "waitlist", "web-signup"],
      }),
    });

    if (!response.ok) {
      const error = await response.text().catch(() => "Unknown error");
      console.error("GHL contact creation failed:", response.status, error);
      return null;
    }

    const data = await response.json();
    console.log("GHL contact created:", data.contact?.id);
    return data;
  } catch (error) {
    console.error("GHL contact creation error:", error);
    return null;
  }
}
