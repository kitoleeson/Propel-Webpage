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

export type TableRow = { label: string; value?: string };
export type TableSection = { title: string; rows: TableRow[] };

export function compileEmailTable(sections: TableSection[], tableOnly: boolean = false) {
	const formatValue = (value?: string) => (value == undefined || value == null || value == "" ? "-" : value);

	let tableContent = "";
	sections.forEach((section) => {
		tableContent += `
		 <tr>
			<td colspan="2" style="padding: 15px 8px 5px 8px; font-size: 14px; color: #1eb9c2; font-weight: bold; text-transform: uppercase; border-bottom: 2px solid #1eb9c2;">
			   ${section.title}
			</td>
		 </tr>
	  `;

		section.rows.forEach((row) => {
			tableContent += `
			<tr>
			   <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 40%; font-size: 13px;">${row.label}</td>
			   <td style="padding: 8px; border-bottom: 1px solid #eee; font-size: 13px;">${formatValue(row.value)}</td>
			</tr>
		 `;
		});
	});

	return tableOnly ? tableContent : `<table style="width: 100%; border-collapse: collapse;">${tableContent}</table>`;
}
