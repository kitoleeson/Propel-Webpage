/** @format */

"use client";

import Icon from "@components/ui/Icon";

type NavBarIconLinkProps = {
	iconName: "instagram" | "email";
	href: string;
	label: string;
	className?: string;
};

export default function NavBarIconLink({ iconName, href, label, className }: NavBarIconLinkProps) {
	return (
		<a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={`group inline-flex items-center justify-center portrait:px-1 landscape:px-2 transition-colors duration-200 ${className}`}>
			<Icon name={iconName} className="h-5 transition-transform group-hover:scale-110" />
		</a>
	);
}
