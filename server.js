const puppeteer = require('puppeteer');
const path = require('path');
const express = require('express')
const app = express()
require('dotenv').config()

const port = process.env.PORT

const epreuves = require('./res/epreuves.json')
// Set static res folder
app.use('/res', express.static(path.join(__dirname, 'res')))

app.get('/', (req, res) => {
	res.redirect('search/')
})

app.get('/search/', async (req, res) => {
	res.sendFile(__dirname + '/pages/search.html');
})

app.get('/searchSwimmer/:query', async (req, res) => {
	let query = req.params.query;
	if (!query) return res.json({ error: 'no query' });
	if (query.length < 3) return res.json({ error: 'query too short' });
	const content = await get(`https://ffn.extranat.fr/webffn/_recherche.php?go=ind&idrch=${query}`);
	try {
		const json = JSON.parse(content);
		res.json(json);
	} catch {
		res.json({ error: 'Error when converting in JSON' });
	}
})
let cache = {}
app.get('/performances/:bacId(25|50)/:swimmerId([0-9]+)', async (req, res) => {
	let bacId = req.params.bacId;
	let swimmerId = req.params.swimmerId;
	if (cache[bacId + '-' + swimmerId]) {
		console.log("From cache")

		return res.json(cache[bacId + '-' + swimmerId])
	}
	if (!bacId || !swimmerId) return res.json({ error: 'no swimmerId' });
	let perf = await getPerf(swimmerId, bacId)
	cache[bacId + '-' + swimmerId] = perf
	res.json(perf)
})

app.get('/epreuves/', async (req, res) => {
	res.json(epreuves);
})

app.listen(port, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})
async function get(url) {
	const browser = await generateBrowser();
	const page = await browser.newPage();
	page.on("error", function (err) {
		theTempValue = err.toString();
		console.log("Error: " + theTempValue)
	});

	await page.goto(url);
	// await page.screenshot({ path: 'example.png' });
	let bodyHTML = await page.evaluate(() => document.body.innerHTML);
	await browser.close();
	return bodyHTML;
}

async function getPerf(nageur, bac) {
	const browser = await generateBrowser();
	const page = await browser.newPage();
	page.on("error", function (err) {
		theTempValue = err.toString();
		console.log("Error: " + theTempValue)
	});

	await page.goto(`https://ffn.extranat.fr/webffn/nat_recherche.php?idact=nat&idrch_id=${nageur}&idopt=prf&idbas=${bac}`);

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
				let date = tr.children[5].textContent.trim().split('/')
				let data = {
					perfTime: tr.children[0].textContent.trim(),
					perfPts: tr.children[3].textContent.trim().replace(/[\(\)pts\ ]/g, ''),
					perfIsRelay: tr.children[1].textContent != '',
					swimmerClub: tr.children[8].textContent.trim(),
					competitionLocation: {
						country: tr.children[4].children[1].textContent.trim().replace(/[\(\)]/g, ''),
						city: tr.children[4].children[2].textContent.trim(),
					},
					competitionDate: date[2] + '-' + date[1] + '-' + date[0],
					competitionLevel: tr.children[6].textContent.trim().replace(/[\[\]]/g, ''),
					competitionLink: tr.children[7].children[0].href
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
					data.splits = split
				}

				result[epreuve].push(data)
			} // sinon c'est un truc inutile
		}
		return result
	});
	await browser.close();
	return swimmerData
}

async function generateBrowser() {
	let data = { args: process.env.PUPPETEER_ARGS.split(' ') }
	if (process.env.CHROMIUM_PATH || process.env.CHROMIUM_PATH == '') data.executablePath = process.env.CHROMIUM_PATH
	return await puppeteer.launch(data);
}