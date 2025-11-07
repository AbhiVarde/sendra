import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 401 }
      );
    }

    // Get webhook body
    const body = await req.text();
    const webhookData = JSON.parse(body);

    // Log for debugging
    console.log("Inbound email webhook received:", {
      type: webhookData.type,
      from: webhookData.data?.from,
    });

    // Forward to Appwrite Function
    const functionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/functions/${process.env.NEXT_PUBLIC_FETCH_DEPLOYMENTS_FUNCTION_ID}/executions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        },
        body: JSON.stringify(webhookData),
      }
    );

    if (!functionResponse.ok) {
      const errorText = await functionResponse.text();
      console.error("Appwrite function error:", errorText);
      return NextResponse.json(
        { error: "Function execution failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" });
}
