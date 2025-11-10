import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("Webhook received from Resend");

    // Get the headers that Resend sends
    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");
      return NextResponse.json({ error: "Missing headers" }, { status: 401 });
    }

    // Get the email data
    const bodyText = await req.text();

    console.log("Forwarding to Appwrite function...");

    const functionUrl = `https://${process.env.NEXT_PUBLIC_FETCH_DEPLOYMENTS_FUNCTION_ID}.fra1.appwrite-function.cloud`;

    const functionResponse = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      },
      body: bodyText,
    });

    const responseText = await functionResponse.text();

    console.log("Function responded:", functionResponse.status);

    if (!functionResponse.ok) {
      console.error("Function failed:", responseText);
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Active" });
}
