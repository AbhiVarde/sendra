import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const payload = JSON.parse(bodyText);

    if (payload.type !== "email.received") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Send hardcoded test to function
    const testPayload = {
      type: "email.received",
      data: {
        from: payload.data?.from || "test@example.com",
        subject: "Test",
        text: "/overview",
      },
    };

    await fetch(
      `https://fra.cloud.appwrite.io/v1/functions/68d2352a000a8f7a6959/executions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": "68d130a4002d184d666f",
        },
        body: JSON.stringify({
          body: JSON.stringify(testPayload),
          async: false,
        }),
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "active" });
}
