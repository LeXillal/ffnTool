const puppeteer = require('puppeteer');
const fs = require('fs');
const proxyList = fs.readFileSync('proxy.txt', 'utf-8').split('\n')

async function run() {
	const proxy = proxyList[Math.floor(Math.random() * proxyList.length)]
	console.log(proxy)
	const browser = await puppeteer.launch({
		headless: true,
		args: [`--proxy-server=SOCKS5://${proxy}`]
	});
	const page = await browser.newPage();

	const pageUrl = 'http://myip.dnsomatic.com/';

	await page.goto(pageUrl);
	// get the content of the page in json format
	const content = await page.content();
	console.log(content);
	await browser.close();
}

run();