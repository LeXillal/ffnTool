const puppeteer = require('puppeteer');

module.exports = async () => {
	let data = { args: process.env.PUPPETEER_ARGS.split(' ') }
	if (process.env.CHROMIUM_PATH || process.env.CHROMIUM_PATH == '') data.executablePath = process.env.CHROMIUM_PATH
	return await puppeteer.launch(data);
}