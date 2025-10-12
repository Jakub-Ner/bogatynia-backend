import { NextResponse } from "next/server";
import { processIncomingEmail } from "@/lib/email-processor";
import { writeFile } from "fs/promises";
import { readFile } from "fs/promises";

async function saveToFile(data: any, filename: string) {
    return await writeFile(filename, JSON.stringify(data, null, 2));
}
async function readFromFile(filename: string) {
    const fileContents = await readFile(filename, "utf-8");
    return JSON.parse(fileContents);
}

export async function POST(request: Request) {
    try {
        const emailData = await request.json();

        // const emailData = await readFromFile("./latest-email.json");
        // await saveToFile(emailData, "./latest-email.json");
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
