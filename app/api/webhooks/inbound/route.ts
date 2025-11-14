import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    console.log("📧 Webhook received from Resend");

    // Get the Svix headers
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing Svix headers");
      return NextResponse.json({ error: "Missing headers" }, { status: 401 });
    }

    // Get the raw body
    const bodyText = await req.text();
    console.log("📦 Received payload");

    // Parse the webhook payload
    let webhookPayload;
    try {
      webhookPayload = JSON.parse(bodyText);
    } catch (parseErr) {
      console.error("❌ Failed to parse payload:", parseErr);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Verify it's an email.received event
    if (webhookPayload.type !== "email.received") {
      console.log("ℹ️ Not an email.received event, ignoring");
      return NextResponse.json(
        { success: true, message: "Ignored" },
        { status: 200 }
      );
    }

    const emailData = webhookPayload.data;
    const emailId = emailData.email_id;
    const fromEmail = emailData.from;

    console.log("📨 Email from:", fromEmail);
    console.log("🆔 Email ID:", emailId);

    // Fetch the full email content using Resend API
    const resend = new Resend(process.env.RESEND_API_KEY);

    console.log("🔍 Fetching email content from Resend...");
    const emailContent = await resend.emails.get(emailId);

    console.log("📄 Email fetched successfully");
    console.log("📝 Subject:", emailContent.data?.subject);
    console.log("✉️ Text preview:", emailContent.data?.text?.substring(0, 100));

    // Forward to Appwrite function with the complete email data
    const functionId =
      process.env.NEXT_PUBLIC_APPWRITE_FETCH_DEPLOYMENTS_FUNCTION_ID;

    if (!functionId) {
      console.error("❌ Missing function ID");
      return NextResponse.json(
        { error: "Function ID not configured" },
        { status: 500 }
      );
    }

    const functionUrl = `https://fra.cloud.appwrite.io/v1/functions/${functionId}/executions`;

    // Create the complete payload with email content
    const completePayload = {
      ...webhookPayload,
      data: {
        ...emailData,
        text: emailContent.data?.text || "",
        html: emailContent.data?.html || "",
      },
    };

    console.log("🚀 Forwarding to Appwrite function...");

    const functionResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      },
      body: JSON.stringify({
        data: JSON.stringify(completePayload),
        async: false,
      }),
    });

    const responseData = await functionResponse.json();

    if (!functionResponse.ok) {
      console.error("❌ Function failed:", responseData);
      return NextResponse.json(
        { error: "Function execution failed", details: responseData },
        { status: 500 }
      );
    }

    console.log("✅ Webhook processed successfully");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ status: "Webhook active" });
}
