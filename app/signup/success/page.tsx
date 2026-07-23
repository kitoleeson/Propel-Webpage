/** @format */
// Layout by Google Gemini

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupSuccessPage() {
	const router = useRouter();
	const [secondsLeft, setSecondsLeft] = useState(10);

	useEffect(() => {
		const interval = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
		const timeout = setTimeout(() => router.push("/"), 10000);

		return () => {
			clearInterval(interval);
			clearTimeout(timeout);
		};
	}, [router]);

	return (
		<div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 space-y-6">
			<h1 className="text-4xl font-bold text-primary">Thanks for your response!</h1>
			<p className="text-lg text-gray-600 max-w-md">Please expect an email confirmation from us in the next few minutes. We are looking forward to working with you!</p>

			<div className="pt-4 text-sm text-gray-400">
				Redirecting you back to the home page in <span className="font-bold text-primary text-base">{secondsLeft}</span> seconds...
			</div>

			<Link href="/" className="text-sm font-semibold text-primary hover:text-primary-hover underline underline-offset-4 transition-colors">
				Go back immediately
			</Link>
		</div>
	);
}
