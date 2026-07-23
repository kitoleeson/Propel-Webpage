/** @format */

import nodemailer from "nodemailer";
import Mail from "nodemailer/lib/mailer";

export async function sendEmail(data: Mail.Options) {
	const test = process.env.APP_ENV != "prod";
	const transporter = nodemailer.createTransport({
		host: test ? process.env.TEST_SMTP_HOST : process.env.SMTP_HOST,
		port: Number(test ? process.env.TEST_SMTP_PORT : process.env.SMTP_PORT),
		secure: false,
		auth: {
			user: test ? process.env.TEST_SMTP_USER : process.env.SMTP_USER,
			pass: test ? process.env.TEST_SMTP_PASSWORD : process.env.SMTP_PASSWORD,
		},
	});

	const options = {
		...data,
		from: data.from || `"Propel Automated System" <${test ? process.env.TEST_SMTP_USER : process.env.SMTP_USER}>`,
		to: data.to || process.env.ADMIN_EMAIL,
	};

	return transporter.sendMail(options);
}
