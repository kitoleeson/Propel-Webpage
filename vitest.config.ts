/** @format */

import { defineConfig } from "vitest/config";
import { neonTesting } from "neon-testing/vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	plugins: [neonTesting(), react(), tsconfigPaths()],
	test: {
		environment: "node",
		testTimeout: 30000,
		include: ["tests/integration/**/*.test.ts", "tests/end_to_end/**/*.test.ts"],
		globals: true,
		setupFiles: ["tests/test-setup.ts"],
		maxWorkers: 8,
	},
});
