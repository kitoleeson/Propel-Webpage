/** @format */

"use client";

import * as Icons from "@/icons";

export type IconName = keyof typeof Icons;

export default function Icon({ name, className }: { name: IconName; className?: string }) {
	if (!Icons[name]) return null;
	const IconComponent = Icons[name];
	return <IconComponent className={`inline-block ${className}`} />;
}
