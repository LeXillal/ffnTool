// Variables
let timeoutSearchBar = null;
let epreuvesList = null;
let selectedSwimmer = null;
// Elements
const searchBar = document.getElementById('searchBar');
const resultDiv = document.getElementById('searchResult');
const swimmerName = document.getElementById('swimmerName');
const bacSelector = document.getElementById("bacSelector")
const infoDiv = document.getElementById('infoContent');
const performancesDiv = document.getElementById('performancesContent')

window.onload = async () => {
	// Get epreuves
	const response = await fetch('/epreuves/').then(response => response.json());
	epreuvesList = response;
}
searchBar.addEventListener('keyup', function (event) {
	clearTimeout(timeoutSearchBar);
	timeoutSearchBar = setTimeout(() => searchSwimmer(searchBar.value), 300);
});

async function searchSwimmer(value) {
	let response = await fetch('/searchSwimmer/' + value).then(response => response.json());
	// Put result in the list
	resultDiv.innerHTML = '';
	for (let i = 0; i < response.length; i++) {
		const element = response[i];
		const div = document.createElement('div');
		div.innerHTML = element.ind;
		div.style.color = element.sex
		div.onclick = () => selectswimmer(element)
		resultDiv.appendChild(div);
	}
}

function selectswimmer(data) {
	// On vide les valeur de recherches
	searchBar.value = ''
	resultDiv.innerHTML = ''

	// On met à jour les valeurs pour savoir quel nageur est sélectionné
	selectedSwimmer = data
	swimmerName.innerText = data.ind

	// On affiche le div d'information
	getPerfs()
	infoDiv.classList.remove('hidden')
}

bacSelector.addEventListener('change', () => getPerfs())

async function getPerfs() {
	const bassin = bacSelector.value

	let url = `/performances/${bassin}/${selectedSwimmer.iuf}`
	let response = await fetch(url).then(response => response.json());
	console.log(response);

	performancesDiv.innerHTML = ''
	// Create pre
	const pre = document.createElement('pre')
	pre.innerText = JSON.stringify(response, null, 2)
	performancesDiv.appendChild(pre)
}