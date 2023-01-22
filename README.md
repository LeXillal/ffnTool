# ffnTool

```
import { findSwimmers, getPerformances, getBestPerformances } from './ffn/index.js';

findSwimmers('piron thomas').then((swimmers) => {
	console.log(swimmers);
	let iuf = swimmers[0].iuf;
	getPerformances(50, iuf).then((data) => {
		console.log(JSON.stringify(data));
	})

	getBestPerformances(50, iuf).then((data) => {
		console.log(JSON.stringify(data));
	})
})
```