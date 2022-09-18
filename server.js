const puppeteer = require('puppeteer');
const path = require('path');
const express = require('express')
const app = express()
const port = 4444
const epreuves = require('./res/epreuves.json')
// Set static res folder
app.use('/res', express.static(path.join(__dirname, 'res')))
app.get('/', (req, res) => {
	// serve index.html
	res.sendFile(__dirname + '/index.html');
})

app.get('/searchswimmer/:query', async (req, res) => {
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



app.get('/epreuves/', async (req, res) => {
	console.log(epreuves)
	res.json(epreuves);
})

app.listen(port, () => {
	console.log(`Example app listening on port ${port}`)
})

async function get(url) {
	const browser = await puppeteer.launch();
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