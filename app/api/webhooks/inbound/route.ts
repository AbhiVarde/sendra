import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    console.log("📧 Webhook received from Resend");

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing Svix headers");
      return NextResponse.json({ error: "Missing headers" }, { status: 401 });
    }

    // Get ORIGINAL body text - needed for signature verification
    const originalBodyText = await req.text();
    let webhookPayload;

    try {
      webhookPayload = JSON.parse(originalBodyText);
    } catch (parseErr) {
      console.error("❌ Failed to parse payload:", parseErr);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (webhookPayload.type !== "email.received") {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const emailData = webhookPayload.data;
    const emailId = emailData.email_id;

    console.log("📨 Email from:", emailData.from);
    console.log("🆔 Email ID:", emailId);

    // Fetch email content
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailContent = await resend.emails.get(emailId);

    console.log("📄 Text preview:", emailContent.data?.text?.substring(0, 100));

    // Create payload with email content AND original body for verification
    const completePayload = {
      ...webhookPayload,
      data: {
        ...emailData,
        text: emailContent.data?.text || "",
        html: emailContent.data?.html || "",
      },
      svixHeaders: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      // Include ORIGINAL body for signature verification
      originalBody: originalBodyText,
    };

    const functionId =
      process.env.NEXT_PUBLIC_APPWRITE_FETCH_DEPLOYMENTS_FUNCTION_ID;
    const functionUrl = `https://fra.cloud.appwrite.io/v1/functions/${functionId}/executions`;

    console.log("🚀 Forwarding to Appwrite...");

    const functionResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
      },
      body: JSON.stringify({
        body: JSON.stringify(completePayload),
        async: false,
      }),
    });

    const responseData = await functionResponse.json();

    if (!functionResponse.ok) {
      console.error("❌ Function failed:", responseData);
      return NextResponse.json(
        { error: "Function execution failed" },
        { status: 500 }
      );
    }

    console.log("✅ Success!");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "active" });
}
