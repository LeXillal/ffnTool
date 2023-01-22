import { launch } from 'puppeteer';

export default async () => {
	let data = { args: ['--no-sandbox'] }
	if (process.env.CHROMIUM_PATH || process.env.CHROMIUM_PATH == '') data.executablePath = process.env.CHROMIUM_PATH
	return await launch(data);
}