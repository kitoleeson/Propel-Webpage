/** @format */

import { NextRequest, NextResponse } from "next/server";
import { approvePendingTutor } from "@/lib/db/actions";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get("id"));

	if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

	try {
		const { gov_first, gov_last, insertion } = await approvePendingTutor(id);
		const action = insertion ? "insertion" : "update";
		return new NextResponse(
			`
            <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f7f6;">
               <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center;">
                  <h1 style="color: #1eb9c2; margin-top: 0;">Approval Complete</h1>
                  <p style="font-size: 1.1rem; color: #333;">
                     Successfully processed the <strong>${action}</strong> for <br/>
                     <span style="color: #1eb9c2; font-weight: bold;">${gov_first} ${gov_last}</span>.
                  </p>
                  <p style="color: #666; font-size: 0.9rem;">You can safely close this tab.</p>
               </div>
            </body>
         `,
			{
				status: 200,
				headers: { "Content-Type": "text/html" },
			},
		);
	} catch (error: any) {
		console.error("Approval Error:", error);
		if (error.message === "PENDING_NOT_FOUND") return new NextResponse("Request not found or already processed.", { status: 404 });
		return new NextResponse("Internal Server Error", { status: 500 });
	}
}
