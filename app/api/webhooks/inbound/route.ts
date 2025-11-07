import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    console.log("Inbound webhook received");

    // Get Svix headers
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");
      return NextResponse.json(
        { error: "Missing Svix headers" },
        { status: 401 }
      );
    }

    // Verify webhook signature
    const body = await req.text();
    const webhookSecret = process.env.RESEND_INBOUND_WEBHOOK_SECRET;

    if (
      webhookSecret &&
      !verifySignature(
        body,
        svixId,
        svixTimestamp,
        svixSignature,
        webhookSecret
      )
    ) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const webhookData = JSON.parse(body);

    console.log("Webhook data:", {
      type: webhookData.type,
      from: webhookData.data?.from,
      subject: webhookData.data?.subject,
    });

    // Call Appwrite Function with webhook data in body
    const functionResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/functions/${process.env.NEXT_PUBLIC_APPWRITE_FETCH_DEPLOYMENTS_FUNCTION_ID}/executions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        },
        body: body,
      }
    );

    const responseText = await functionResponse.text();
    console.log("Function response:", {
      status: functionResponse.status,
      body: responseText.substring(0, 200),
    });

    if (!functionResponse.ok) {
      console.error("Appwrite function error:", responseText);
      return NextResponse.json(
        { error: "Function execution failed", details: responseText },
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

function verifySignature(
  body: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string,
  webhookSecret: string
): boolean {
  try {
    const signedContent = `${svixId}.${svixTimestamp}.${body}`;

    const secret = webhookSecret.startsWith("whsec_")
      ? webhookSecret.slice(6)
      : webhookSecret;

    const secretBytes = Buffer.from(secret, "base64");
    const expectedSignature = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    const signatures = svixSignature.split(" ").map((sig) => {
      const [, signature] = sig.split(",");
      return signature;
    });

    return signatures.some((sig) => sig === expectedSignature);
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

export async function GET() {
  return NextResponse.json({
    status: "Inbound webhook endpoint active",
    timestamp: new Date().toISOString(),
  });
}
