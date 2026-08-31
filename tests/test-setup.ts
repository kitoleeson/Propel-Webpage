/** @format */

// Based on https://neon.com/blog/neon-testing-a-vitest-library-for-your-integration-tests
// and https://github.com/starmode-base/neon-testing?tab=readme-ov-file

import { makeNeonTesting } from "neon-testing";
import * as dotenv from "dotenv";
import path from "path";
import { vi } from "vitest";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// -----------------------------------------------------------------------------
// Mock Next.js Server Runtime Utilities (for Server Actions testing)
// -----------------------------------------------------------------------------
vi.mock("next/cache", () => ({
	revalidatePath: vi.fn(),
	revalidateTag: vi.fn(),
	unstable_cache: vi.fn((fn) => fn),
}));

vi.mock("next/navigation", () => ({
	redirect: vi.fn(),
	notFound: vi.fn(),
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
	}),
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

// -----------------------------------------------------------------------------
// Neon Database Setup
// -----------------------------------------------------------------------------
export const withNeonTestBranch = makeNeonTesting({
	apiKey: process.env.NEON_API_KEY!,
	projectId: process.env.NEON_PROJECT_ID!,
	autoCloseWebSockets: true,
});
