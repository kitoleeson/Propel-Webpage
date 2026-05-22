/** @format */
"use client";

import NavBarIconLink from "./NavBarIconLink";
import { usePathname } from "next/navigation";
import { NavLink } from "@/lib/validation/components";
import LinkUnderline from "@/components/ui/LinkUnderline";

const navLinks: NavLink[] = [
	{ name: "home", href: "/", anchor: "HOME" },
	{ name: "about", href: "/about", anchor: "ABOUT" },
	{ name: "sign up", href: "/signup", anchor: "SIGN UP" },
	{ name: "support", href: "/support", anchor: "SUPPORT" },
];

const NavBar = () => {
	const pathname = usePathname();

	return (
		<div className="flex items-center justify-between w-full p-3">
			<div className="flex items-center">
				<NavBarIconLink iconName="email" href="mailto:propeltutoringyeg@gmail.com" label="Email" className="nav-icon" />
				{/* <NavBarIconLink iconName="instagram" href="https://www.instagram.com" label="Instagram" className="nav-icon" /> */}
			</div>
			<div className="flex items-center landscape:gap-3 portrait:gap-0">
				{navLinks.map((link) => (
					<LinkUnderline key={link.href} link={link} showActive={pathname === link.href} />
				))}
			</div>
		</div>
	);
};

export default NavBar;

// TODO:
// - use global css file to dictate default: colours, fonts, textsizes, etc
// - use css modules per component where needed for extra functionality
