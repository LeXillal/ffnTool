const generateBrowser = require("./generateBrowser")

module.exports = async (bac, nageur) => {
	const browser = await generateBrowser();
	const page = await browser.newPage();

	await page.goto(`https://ffn.extranat.fr/webffn/nat_recherche.php?idact=nat&idrch_id=${nageur}&idopt=prf&idbas=${bac}`);

	let swimmerData = await page.evaluate(() => {
		let trList = document.querySelectorAll('table#styleNoBorderNoBottom tbody')[1].children
		let result = {}
		let epreuve = 'idk';
		for (let i = 0; i < trList.length; i++) {
			let tr = trList[i]
			let textContent = tr.textContent.trim().replace(/[\n\t]/g, '')
			let splited = textContent.split(' - ')
			if (splited[1] && splited[1].startsWith('Bassin')) { // Si y'a le mot "Bassin" dans la deuxième partie du split c'est une épreuve
				epreuve = splited[0]
				result[epreuve] = []
			} else if (epreuve !== 'idk' && textContent.includes('pts')) { // Si y'a le mot "pts" dans le texte c'est un résultat
				let date = tr.children[5].textContent.trim().split('/')
				let link = tr.children[7].children[0].href.toString()
				let data = {
					perf: {
						perfTime: tr.children[0].textContent.trim(),
						perfPts: tr.children[3].textContent.trim().replace(/[\(\)pts\ ]/g, ''),
						perfIsRelay: tr.children[1].textContent != '',
						perfClub: tr.children[8].textContent.trim(),
						perfType: link.split('idepr=')[1].split('&')[0]
					},
					competition: {
						competitionLocation: {
							country: tr.children[4].children[1].textContent.trim().replace(/[\(\)]/g, ''),
							city: tr.children[4].children[2].textContent.trim(),
						},
						competitionDate: date[2] + '-' + date[1] + '-' + date[0],
						competitionLevel: tr.children[6].textContent.trim().replace(/[\[\]]/g, ''),
						competitionId: link.split('&idcpt=')[1].split('&')[0]
					}
				}

				// On regarde si il y as les splits
				if (tr.children[0].children.length) {
					let tdList = tr.children[0].firstChild.onmouseover.toString().match(/<tr>(.*)<\/tr>/)[1].toString().replace(/\\/g, '')
					tdList = tdList.split('</td><td').map(x => x.replace(/.+>/g, '')).filter(x => x != '')
					let split = {}
					for (let i = 0; i < tdList.length; i += 3) {
						let dist = tdList[i].replace(/[m:]/g, '').trim()
						split[dist] = { total: tdList[i + 1] }

						if (tdList[i + 2]) {
							split[dist].splitTime = tdList[i + 2].replace(/[\(\)]/g, '')
						}
					}
					data.perf.splits = split
				}

				result[epreuve].push(data)
			} // sinon c'est un truc inutile
		}
		return result
	});
	await browser.close();
	return swimmerData
}