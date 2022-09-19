const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({
		executablePath: '/usr/bin/chromium-browser',
		args: ['--no-sandbox']
	});
	const page = await browser.newPage();
	page.on("error", function (err) {
		theTempValue = err.toString();
		console.log("Error: " + theTempValue)
	});

	await page.goto('https://ffn.extranat.fr/webffn/nat_recherche.php?idact=nat&idrch_id=1390507&idopt=prf&idbas=25');
	// await page.screenshot({ path: 'example.png' });
	// let bodyHTML = await page.evaluate(() => document.body.innerHTML);
	let tbody = await page.evaluate(() => {
		let trList = document.querySelectorAll('table#styleNoBorderNoBottom tbody')[1].children
		let result = {}
		let epreuve = 'idk';
		for (let i = 0; i < trList.length; i++) {
			let tr = trList[i]
			let textContent = tr.textContent.trim().replace(/[\n\t]/g, '')
			let innerHTML = tr.innerHTML.trim().replace(/[\n\t]/g, '')
			let splited = textContent.split(' - ')
			if (splited[1] && splited[1].startsWith('Bassin')) {
				epreuve = splited[0]
				result[epreuve] = []
			} else if (epreuve !== 'idk' && textContent.includes('pts')) {
				result[epreuve].push(textContent)
			}
		}
		return result
	});
	console.log(tbody);
	await browser.close();


	// bodyHTML = bodyHTML.split(`<table cellpadding="2" id="styleNoBorderNoBottom">`)[1].split('<table>')[0].replace(/[\t\n]/g, '').replace('<tbody>', '').replace('</tbody>', '').split('</tr>')


})()