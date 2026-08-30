/** @format */

import { NextRequest } from "next/server";
import { tutorAcceptStudent } from "@/lib/db/actions/workflows/onboard_client";
import { handleRouteError, renderHtmlResponse } from "../utils";

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url);
	const id = Number(searchParams.get("id"));

	if (!id || isNaN(id)) return renderHtmlResponse({ title: "Invalid Request", message: "Missing or invalid request ID.", isError: true });

	try {
		const { student_first, student_last } = await tutorAcceptStudent(id);
		return renderHtmlResponse({
			title: "Acceptance Complete",
			message: `Successfully accepted new student:<br/><span style="color: #1eb9c2; font-weight: bold;">${student_first} ${student_last}</span>.`,
		});
	} catch (error: any) {
		return handleRouteError(error, "New Student Acceptance");
	}
}
