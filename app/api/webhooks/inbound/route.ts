import { NextRequest, NextResponse } from "next/server";

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

    // Use the correct Resend API endpoint for inbound emails
    const emailContentResponse = await fetch(
      `https://api.resend.com/emails/${emailId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
      }
    );

    if (!emailContentResponse.ok) {
      console.error(
        "❌ Failed to fetch email content:",
        await emailContentResponse.text()
      );
      // If we can't get content, forward anyway with empty text
      const completePayload = {
        ...webhookPayload,
        data: {
          ...emailData,
          text: "",
          html: "",
        },
        svixHeaders: {
          id: svixId,
          timestamp: svixTimestamp,
          signature: svixSignature,
        },
        originalBody: originalBodyText,
      };

      await forwardToAppwrite(completePayload);
      return NextResponse.json({ success: true }, { status: 200 });
    }

    const emailContent = await emailContentResponse.json();

    console.log("📄 Email content received");
    console.log("Text length:", emailContent.text?.length || 0);
    console.log("HTML length:", emailContent.html?.length || 0);
    console.log("Text preview:", emailContent.text?.substring(0, 200));

    // Forward complete payload to Appwrite
    const completePayload = {
      ...webhookPayload,
      data: {
        ...emailData,
        text: emailContent.text || emailContent.html || "",
        html: emailContent.html || "",
      },
      svixHeaders: {
        id: svixId,
        timestamp: svixTimestamp,
        signature: svixSignature,
      },
      originalBody: originalBodyText,
    };

    await forwardToAppwrite(completePayload);

    console.log("✅ Success!");
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function forwardToAppwrite(payload: any) {
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
      body: JSON.stringify(payload),
      async: false,
    }),
  });

  if (!functionResponse.ok) {
    const responseData = await functionResponse.json();
    console.error("❌ Function failed:", responseData);
    throw new Error("Function execution failed");
  }

  return functionResponse.json();
}

export async function GET() {
  return NextResponse.json({ status: "active" });
}
