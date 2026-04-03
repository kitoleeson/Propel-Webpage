/** @format */
"use client";

import Link from "next/link";
import IconLink from "./IconLink";
import { usePathname } from "next/navigation";

const navLinks = [
	{ name: "home", href: "/" },
	{ name: "about", href: "/about" },
	{ name: "sign up", href: "/signup" },
	{ name: "support", href: "/support" },
];

const NavBar = () => {
	const pathname = usePathname();
	const isActive = (path: string) => pathname === path;

	return (
		<div className="flex items-center justify-between w-full p-2">
			<div className="flex items-center">
				<IconLink iconName="instagram" href="https://www.instagram.com" label="Instagram" className="nav-icon" />
				<IconLink iconName="email" href="mailto:propeltutoringyeg@gmail.com" label="Email" className="nav-icon" />
			</div>
			<div className="flex items-center landscape:gap-3 portrait:gap-0">
				{navLinks.map((link) => (
					<Link key={link.href} href={link.href} className={`nav-link group relative py-0.5 transition-all duration-300 ${isActive(link.href) ? "font-bold" : "font-normal"}`}>
						{link.name.toUpperCase()}
						<span className={`absolute bottom-0 left-0 h-0.5 bg-current transition-all duration-200 ease-out origin-center ${isActive(link.href) ? "w-full scale-x-75" : "w-full scale-x-0 group-hover:scale-x-75"}`} />
					</Link>
				))}
			</div>
		</div>
	);
};

export default NavBar;

// TODO:
// - use global css file to dictate default: colours, fonts, textsizes, etc
// - use css modules per component where needed for extra functionality
