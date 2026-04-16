const SENDBLUE_API_URL = "https://api.sendblue.com";

export async function sendIMessage(phone: string, content: string) {
  const response = await fetch(`${SENDBLUE_API_URL}/api/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "sb-api-key-id": process.env.SENDBLUE_API_KEY ?? "",
      "sb-api-secret-key": process.env.SENDBLUE_API_SECRET ?? "",
    },
    body: JSON.stringify({
      number: phone,
      content,
      from_number: process.env.SENDBLUE_FROM_NUMBER,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Sendblue API error: ${response.status} - ${error.message ?? "Unknown error"}`
    );
  }

  return response.json();
}

export async function evaluateService(phone: string) {
  const response = await fetch(
    `${SENDBLUE_API_URL}/api/evaluate-service?number=${encodeURIComponent(phone)}`,
    {
      headers: {
        "sb-api-key-id": process.env.SENDBLUE_API_KEY ?? "",
        "sb-api-secret-key": process.env.SENDBLUE_API_SECRET ?? "",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}
