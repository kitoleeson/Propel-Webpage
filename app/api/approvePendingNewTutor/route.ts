/** @format */

import { NextRequest } from "next/server";
import { approvePendingNewTutor } from "@/lib/db/actions/workflows/tutor_forms";
import { handleRouteError, renderHtmlResponse } from "../utils";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get("id"));

	if (!id || isNaN(id)) return renderHtmlResponse({ title: "Invalid Request", message: "Missing or invalid pending tutor ID.", isError: true });

	try {
		const { gov_first, gov_last, insertion } = await approvePendingNewTutor(id);
		const action = insertion ? "insertion" : "update";

		return renderHtmlResponse({
			title: "Approval Complete",
			message: `Successfully processed the <strong>${action}</strong> for <br/>
            <span style="color: #1eb9c2; font-weight: bold;">${gov_first} ${gov_last}</span>.`,
		});
	} catch (error: any) {
		return handleRouteError(error, "Pending Tutor Approval");
	}
}
