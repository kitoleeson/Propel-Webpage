/** @format */
"use client";

import BasePage from "@/components/ui/base_page/BasePage";
import TextUnderline from "@/components/ui/TextUnderline";
import Link from "next/link";

const SupportPage = () => {
	return (
		<BasePage title="Support">
			<p>
				For any and all queries and help, please reach out to us directly at{" "}
				<Link href="mailto:propeltutoringyeg@gmail.com" className="font-bold group">
					<TextUnderline textColour="text-primary group-hover:text-primary-hover" lineColour="bg-primary group-hover:bg-primary-hover" lineWeight="h-0.5">
						propeltutoringyeg@gmail.com
					</TextUnderline>
				</Link>
				.
			</p>
			<br />
			<p>Frequently Asked Questions coming soon..</p>
		</BasePage>
	);
};

export default SupportPage;
