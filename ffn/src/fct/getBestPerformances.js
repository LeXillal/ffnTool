import generateBrowser from "./generateBrowser.js";

export default async (bac, nageur) => {
	const browser = await generateBrowser();
	const page = await browser.newPage();

	const link = `https://ffn.extranat.fr/webffn/nat_recherche.php?idact=nat&idrch_id=${nageur}`;
	await page.goto(link);

	let swimmerData = await page.evaluate(() => {
		let is50 = false
		let lists = Array.from(document.querySelectorAll('table#styleNoBorderNoBottom > tbody > tr')).slice(2).reduce((acc, tr) => {
			if (tr.querySelector('.tetiere')) is50 = true
			if (is50) {
				acc.bassin50.push(tr)
			} else {
				acc.bassin25.push(tr);
			}
			return acc;
		}, { bassin25: [], bassin50: [] })

		let fil = (list) => list.filter(tr => tr.onmouseover)
		let bassin25 = fil(lists.bassin25)
		let bassin50 = fil(lists.bassin50)
		bassin25 = bassin25.map(trToResult)
		bassin50 = bassin50.map(trToResult)

		function trToResult(tr) {
			let link = tr.children[7].children[0].href.toString()
			let data = {
				perf: {
					perfTime: tr.children[1].textContent.trim(),
					perfPts: tr.children[3].textContent.trim().replace(/[\(\)pts\ ]/g, ''),
					perfClub: tr.children[8].textContent.trim(),
					perfTypeId: Number(link.split('idepr=')[1].split('&')[0])
				},
				competition: {
					competitionLocation: {
						country: tr.children[4].children[1].textContent.trim().replace(/[\(\)]/g, ''),
						city: tr.children[4].children[2].textContent.trim(),
					},
					competitionDate: tr.children[5].textContent.trim(),
					competitionLevel: tr.children[6].textContent.trim().replace(/[\[\]]/g, ''),
					competitionId: link.split('&idcpt=')[1].split('&')[0]
				}
			}
			if (tr.children[1].firstChild.onmouseover) {
				let tdList = tr.children[1].firstChild.onmouseover.toString().match(/<tr>(.*)<\/tr>/)[1].toString().replace(/\\/g, '')
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

			return data
		}
		return {25:bassin25, 50:bassin50}
	});
	await browser.close();

	return swimmerData
}