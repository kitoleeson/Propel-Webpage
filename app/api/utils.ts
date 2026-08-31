/** @format */

import { NextResponse } from "next/server";

interface RenderHtmlOptions {
	title: string;
	message: string;
	isError?: boolean;
	status?: number;
}

export function renderHtmlResponse({ title, message, isError = false, status }: RenderHtmlOptions) {
	const primaryColor = isError ? "#e53e3e" : "#1eb9c2";
	const defaultStatus = isError ? 400 : 200;

	return new NextResponse(
		`
        <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f4f7f6;">
           <div style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; max-width: 400px;">
              <h1 style="color: ${primaryColor}; margin-top: 0;">${title}</h1>
              <p style="font-size: 1.1rem; color: #333; line-height: 1.5;">
                 ${message}
              </p>
              <p style="color: #666; font-size: 0.9rem; margin-top: 1.5rem;">You can safely close this tab.</p>
           </div>
        </body>
     `,
		{
			status: status ?? defaultStatus,
			headers: { "Content-Type": "text/html" },
		},
	);
}

export function handleRouteError(error: any, logPrefix: string) {
	console.error(`${logPrefix} Error:`, error);

	if (error.message === "PENDING_NOT_FOUND") {
		return renderHtmlResponse({
			title: "Not Found",
			message: "This request was not found or has already been processed.",
			isError: true,
			status: 404,
		});
	}

	const dbDetail = error.detail || error.message;

	return renderHtmlResponse({
		title: "Action Failed",
		message: `Failed to process request.<br/><br/><small style="color: #666; font-family: monospace;">${dbDetail}</small>`,
		isError: true,
		status: 500,
	});
}
