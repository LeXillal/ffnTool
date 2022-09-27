const puppeteer = require('puppeteer');
const path = require('path');
const express = require('express')
const app = express()
const ffn = require('./ffn/index.js')

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
	try {
		const swimmers = await ffn.findSwimmers(query);
		const json = JSON.parse(swimmers);
		res.json(json);
	} catch (e) {
		console.log(e)
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
	let perf = await ffn.getPerformances(bacId, swimmerId);
	cache[bacId + '-' + swimmerId] = perf
	res.json(perf)
})

app.get('/epreuves/', async (req, res) => {
	res.json(epreuves);
})

app.listen(port, () => {
	console.log(`Example app listening on port ${process.env.PORT}`)
})
