/** @format */

import { defineConfig } from "vitest/config";
import { neonTesting } from "neon-testing/vite";
import react from "@vitejs/plugin-react-swc";
import tsconfigPaths from "vite-tsconfig-paths";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	test: {
		globals: true,
		testTimeout: 30000,
		maxWorkers: 8,
		projects: [
			{ extends: true, plugins: [neonTesting()], test: { name: "unit", environment: "node", setupFiles: ["tests/test-setup.ts"], include: ["tests/**/*.test.ts"], exclude: ["tests/**/*.browser.test.ts"] } },
			{
				extends: true,
				define: {
					"process.env": {},
				},
				test: {
					name: "browser",
					include: ["tests/**/*.browser.test.ts(x)"],
					browser: {
						enabled: true,
						// headless: true, // to disable browser testing ui
						provider: playwright(),
						// https://vitest.dev/config/browser/playwright
						// instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
						instances: [{ browser: "chromium" }], // to run only chromium
					},
				},
			},
		],
	},
});
