// Variables
let timeoutSearchBar = null;
let epreuvesList = null;
let selectedSwimmer = null;
// Elements
const searchBar = document.getElementById('searchBar');
const resultDiv = document.getElementById('searchResult');
const swimmerName = document.getElementById('swimmerName');
const epreuveSelector = document.getElementById('epreuveSelector');
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
	console.log(response);
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

	// data : {iuf: '109535', ind: 'BALLOUARD Anne-Cécile (1985) F FRA - TOULOUSE NAT SYNCHRO', sex: '#ff69b4', clb: 'TOULOUSE NAT SYNCHRO'}
	// sexe : F : #ff69b4 / M: #1e90ff
	// Remplire le selecteur avec les epreuves du sexe
	epreuveSelector.innerHTML = ''
	const sexe = data.sex == "#ff69b4" ? 0 : 1
	const epreuves = epreuvesList[sexe]

	for (epreuve of Object.keys(epreuves)) {
		let intitule = epreuves[epreuve]
		const option = document.createElement('option');
		option.value = epreuve
		option.innerText = intitule
		epreuveSelector.appendChild(option)
	}

	// On affiche le div d'information
	infoDiv.classList.remove('hidden')
}

epreuveSelector.addEventListener('change', () => getPerf())
bacSelector.addEventListener('change', () => getPerf())

async function getPerf() {
	const bassin = bacSelector.value
	const epreuve = epreuveSelector.value

	let url = `/performances/${bassin}/${epreuve}/${selectedSwimmer.iuf}`
	let response = await fetch(url).then(response => response.json());
	console.log(response);

	// reponse = {prf: '0.2446', dat: '2021-10-17'}
	performancesDiv.innerHTML = '';
	for (let i = 0; i < response.length; i++) {
		const element = response[i];
		const div = document.createElement('div');
		// format .dat from 0.2446 to 0:24:46
		let res = element.prf.split('.')[0]
		res += ':' + element.prf.split('.')[1].slice(0, 2)
		res += ':' + element.prf.split('.')[1].slice(2, 4)
		div.innerHTML = element.dat + ' : ' + res;
		performancesDiv.appendChild(div);
	}
}