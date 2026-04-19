/** @format */
import nodemailer from "nodemailer";

async function setupTest() {
	console.log("Generating Ethereal account...");

	// This creates a one-time use test account
	let testAccount = await nodemailer.createTestAccount();

	console.log("--- ETHEREAL CREDENTIALS ---");
	console.log(`SMTP_HOST: ${testAccount.smtp.host}`);
	console.log(`SMTP_PORT: ${testAccount.smtp.port}`);
	console.log(`SMTP_USER: ${testAccount.user}`);
	console.log(`SMTP_PASS: ${testAccount.pass}`);
	console.log("----------------------------");
	console.log("Login here to see emails: " + testAccount.web);
}

setupTest().catch(console.error);
