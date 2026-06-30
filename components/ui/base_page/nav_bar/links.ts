/** @format */

export type NavLink = {
	href: string;
	anchor: string;
	order: number;
};

export const navLinks: Record<string, NavLink> = {
	home: { href: "/", anchor: "HOME", order: 1 },
	team: { href: "/team", anchor: "OUR TEAM", order: 2 },
	signup: { href: "/signup", anchor: "SIGN UP", order: 3 },
	support: { href: "/support", anchor: "SUPPORT", order: 4 },
};
