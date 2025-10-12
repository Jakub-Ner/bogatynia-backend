import { NextResponse } from "next/server";
import { processIncomingEmail } from "@/lib/email-processor";

export async function POST(request: Request) {
    try {
        const emailData = await request.json() as unknown;
        await processIncomingEmail(emailData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error processing email webhook:", error);
        return Response.json(
            { error: "Failed to process email" },
            { status: 500 },
        );
    }
}
