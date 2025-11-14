import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("📧 Webhook received from Resend");

    // Get the Svix headers that Resend sends for verification
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing Svix headers");
      return NextResponse.json({ error: "Missing headers" }, { status: 401 });
    }

    // Get the raw body text
    const bodyText = await req.text();
    console.log("📦 Body received:", bodyText.substring(0, 200) + "...");

    // Parse the body to get email details
    let emailData;
    try {
      emailData = JSON.parse(bodyText);
      console.log("📨 Email from:", emailData.data?.from);
      console.log("📝 Subject:", emailData.data?.subject);
      console.log("📄 Text preview:", emailData.data?.text?.substring(0, 100));
    } catch (parseErr) {
      console.error("❌ Failed to parse email data:", parseErr);
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Forward to Appwrite function
    console.log("🚀 Forwarding to Appwrite function...");

    // Use the correct function ID from your env
    const functionId =
      process.env.NEXT_PUBLIC_APPWRITE_FETCH_DEPLOYMENTS_FUNCTION_ID;

    if (!functionId) {
      console.error(
        "❌ Missing NEXT_PUBLIC_APPWRITE_FETCH_DEPLOYMENTS_FUNCTION_ID"
      );
      return NextResponse.json(
        { error: "Function ID not configured" },
        { status: 500 }
      );
    }

    // Correct Appwrite function URL format
    const functionUrl = `https://fra.cloud.appwrite.io/v1/functions/${functionId}/executions`;

    console.log("🎯 Function URL:", functionUrl);

    const functionResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Appwrite-Project": process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "",
        // Forward the Svix headers for verification in the function
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      },
      body: JSON.stringify({
        data: bodyText,
        async: false, // Wait for response
      }),
    });

    const responseData = await functionResponse.json();
    console.log("✅ Function response:", responseData);

    if (!functionResponse.ok) {
      console.error("❌ Function failed:", responseData);
      return NextResponse.json(
        { error: "Function execution failed", details: responseData },
        { status: 500 }
      );
    }

    console.log("✨ Webhook processed successfully");
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
