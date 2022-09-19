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

	let swimmerData = await page.evaluate(() => {
		let trList = document.querySelectorAll('table#styleNoBorderNoBottom tbody')[1].children
		let result = {}
		let epreuve = 'idk';
		for (let i = 0; i < trList.length; i++) {
			let tr = trList[i]
			let textContent = tr.textContent.trim().replace(/[\n\t]/g, '')
			let innerHTML = tr.innerHTML.trim().replace(/[\n\t]/g, '')
			let splited = textContent.split(' - ')
			if (splited[1] && splited[1].startsWith('Bassin')) { // Si y'a le mot "Bassin" dans la deuxième partie du split c'est une épreuve
				epreuve = splited[0]
				result[epreuve] = []
			} else if (epreuve !== 'idk' && textContent.includes('pts')) { // Si y'a le mot "pts" dans le texte c'est un résultat
				let data = {
					temps: tr.children[0].textContent.trim(),
					relais: tr.children[1].textContent != '',
					pts: tr.children[3].textContent.trim().replace(/[\(\)pts\ ]/g, ''),
					lieu: {
						pays: tr.children[4].children[1].textContent.trim().replace(/[\(\)]/g, ''),
						ville: tr.children[4].children[2].textContent.trim(),
					},
					date: tr.children[5].textContent.trim(),
					niveau: tr.children[6].textContent.trim().replace(/[\[\]]/g, ''),
					club: tr.children[8].textContent.trim(),
					lienCompetition: tr.children[7].children[0].href
				}

				// On regarde si il y as les splits
				if (tr.children[0].children.length) {
					let tdList = tr.children[0].firstChild.onmouseover.toString().match(/<tr>(.*)<\/tr>/)[1].toString().replace(/\\/g, '')
					tdList = tdList.split('</td><td').map(x => x.replace(/.+>/g,'')).filter(x => x != '')
					let split = {}
					for (let i = 0; i < tdList.length; i+=3) {
						split[tdList[i].replace(/[m:]/g, '').trim()] = {time:tdList[i+1],total:tdList[i+2]}
					}
					data.splits = split
				}

				result[epreuve].push(data)
			} // sinon c'est un truc inutile
		}
		return result
	});
	await browser.close();
	console.log(swimmerData)
})()