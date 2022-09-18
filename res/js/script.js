// Variables
let timeoutSearchBar = null;
let epreuvesList = null;
let selectedSwimmer = null;

// Elements
const searchBar = document.getElementById('searchBar');
const resultDiv = document.getElementById('searchResult');
const swimmerName = document.getElementById('swimmerName');
const epreuveSelector = document.getElementById('epreuveSelector');
const infoDiv = document.getElementById('infoContent');

window.onload = async () => {
	// Get epreuves
	const response = await fetch('http://localhost:4444/epreuves/').then(response => response.json());
	epreuvesList = response;
}
searchBar.addEventListener('keyup', function (event) {
	clearTimeout(timeoutSearchBar);
	timeoutSearchBar = setTimeout(() => searchSwimmer(searchBar.value), 300);
});

async function searchSwimmer(value) {
	let recherche = 'http://localhost:4444/searchswimmer/' + value
	let response = await fetch(recherche).then(response => response.json());
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