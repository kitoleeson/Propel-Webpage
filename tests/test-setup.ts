/** @format */

import { makeNeonTesting } from "neon-testing";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const withNeonTestBranch = makeNeonTesting({
	apiKey: process.env.NEON_API_KEY!,
	projectId: process.env.NEON_PROJECT_ID!,
	autoCloseWebSockets: true,
});
