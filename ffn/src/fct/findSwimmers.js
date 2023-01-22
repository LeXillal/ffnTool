import generateBrowser from "./generateBrowser.js";

export default async (query) => {
	if (!query) return { error: 'no query' };
	if (query.length < 3) return { error: 'query too short' };
	const browser = await generateBrowser();
	const url = `https://ffn.extranat.fr/webffn/_recherche.php?go=ind&idrch=${query}`

	const page = await browser.newPage();

	await page.goto(url);

	let content = await page.evaluate(() => document.body.innerHTML);
	await browser.close();
	return JSON.parse(content);
}