let name;
let board;
let gameRunning = false;
let gameTime;
let timer = { interval: undefined, startDate: undefined, };
let gliding = false;
let contextMenuTile = undefined;

// elements
const menuDiv = document.querySelector('div#menu');
const gameDiv = document.querySelector('div#game');
const descriptionDiv = document.querySelector('div#desc');
const toplistDiv = document.querySelector('div#toplist');
const nameTextBox = document.querySelector('input[type=text]#name');
const descriptionButton = document.querySelector('button#desc');
const descriptionCloseButton = document.querySelector('button#closeDesc');
const startButton = document.querySelector('button#start');
const startDummyButton = document.querySelector('button#startDummy');
const loadButton = document.querySelector('button#load');
const newButton = document.querySelector('button#new');
const nameP = document.querySelector('p#name');
const timeP = document.querySelector('p#time');
const congratP = document.querySelector('p#congrat');
const table = document.querySelector('table#game');
const toplist = document.querySelector('tbody#toplist');
const contextMenu = document.querySelector('#contextMenu');
const straightenButton = document.querySelector('button#straighten');
const curveButton = document.querySelector('button#curve');
const deleteButton = document.querySelector('button#delete');
const toplistDifficulty = document.querySelector('#toplist-diff');
const toplistMapNumber = document.querySelector('#toplist-mapnum');

// functions

function updateTile(tile) {
	tile.className = `tile ${board.getDifficulty() === Difficulty.Easy ? 'easy' : 'hard'} ${board.getClass(tile.cellIndex, tile.parentNode.rowIndex)}`;
}

function displayTime() {
	const minutes = Math.floor(gameTime / 60);
	const seconds = gameTime % 60;
	timeP.innerHTML = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

function displayToplist(difficulty, mapNumber) {
	const tl = JSON.parse(localStorage.getItem('topList'))
		.filter(e => 
			Difficulty.fromJSON(e.difficulty) === difficulty && 
			e.mapNumber === mapNumber);
	tl.sort((a, b) => a.gameTime - b.gameTime);
	
	toplist.innerHTML = tl.map((e, i) => `
		<tr>
			<td class="toplist">${i + 1}</td>
			<td class="toplist">${e.name}</td>
			<td class="toplist">${Math.floor(e.gameTime / 60)}:${e.gameTime % 60 < 10 ? '0' : ''}${e.gameTime % 60}</td>
			<td class="toplist">${new Date(e.date).toLocaleString()}</td>
		</tr>`).join('');

	toplistDifficulty.innerHTML = difficulty === Difficulty.Easy ? 'Könnyű' : 'Nehéz';
	toplistMapNumber.innerHTML = `#${mapNumber}`;

	toplistDiv.hidden = false;
}

function startGame(gameState = null) {
	menuDiv.hidden = true;
	gameDiv.hidden = false;

	if(gameState === null) {
		const difficulty = document.querySelector('input[name="difficulty"]:checked').value === 'easy' ? Difficulty.Easy : Difficulty.Hard;
		board = new Board(difficulty);
		name = nameTextBox.value;
		startTimer(0);
		gameRunning = true;
	} else {
		board = gameState.board;
		name = gameState.name;
		gameRunning = gameState.gameRunning;
		if(gameRunning) {
			startTimer(gameState.gameTime);
		}
	}
	table.innerHTML = board.toHTMLTable();
	nameP.innerHTML = name;
	toplistDiv.hidden = true;
	congratP.hidden = true;
}

function showMenu() {
	menuDiv.hidden = false;
	gameDiv.hidden = true;

	if(localStorage.getItem('savedGameState')) {
		loadButton.hidden = false;
	} else {
		loadButton.hidden = true;
	}
}

function checkEnd() {
	if(board.connected()) {
		stopTimer();
		gameRunning = false;

		const result = {
			difficulty: board.getDifficulty(),
			mapNumber: board.getMapNumber(),
			name: name,
			gameTime: gameTime,
			date: new Date(),
		};

		appendToToplistInLocaleStorage(result);
	
		localStorage.removeItem('savedGameState');
		
		displayToplist(result.difficulty, result.mapNumber);

		congratP.hidden = false;
	}
	else {
		saveGameToLocaleStorage();
	}
}

function appendToToplistInLocaleStorage(result) {
	const savedTopList = JSON.parse(localStorage.getItem('topList')) || [];

	savedTopList.push(result);

	localStorage.setItem('topList', JSON.stringify(savedTopList));
}

function saveGameToLocaleStorage() {
	const gameState = {
		name: name,
		board: board,
		gameRunning: gameRunning,
		gameTime: gameTime,
	};

	localStorage.setItem('savedGameState', JSON.stringify(gameState));
}

function getGameStateFromLocaleStorage() {
	const savedGameState = JSON.parse(localStorage.getItem('savedGameState'));

	if(savedGameState) {
		return {
			name: savedGameState.name,
			board: Board.fromJSON(savedGameState.board),
			gameRunning: savedGameState.gameRunning,
			gameTime: savedGameState.gameTime,
		}
	}
	else {
		return null;
	}
}

function startTimer(start) {
	gameTime = start;
	
	timer.startDate = new Date();
	timer.startDate.setSeconds(timer.startDate.getSeconds() - gameTime);
	
	displayTime();

	timer.interval = setInterval(() => {
			gameTime = Math.floor((new Date() - timer.startDate) / 1000);
			saveGameToLocaleStorage();
			displayTime();
	}, 1000);
}

function stopTimer() {
	clearInterval(timer.interval);
}

// event handlers

nameTextBox.addEventListener('input', (e) => {
	if(e.target.value !== '') {
		startDummyButton.hidden = true;
		startButton.hidden = false;
	}
	else {
		startDummyButton.hidden = false;
		startButton.hidden = true;
	}
});

descriptionButton.addEventListener('click', () => {
	descriptionDiv.hidden = false;
});

descriptionCloseButton.addEventListener('click', () => {
	descriptionDiv.hidden = true;
});

startButton.addEventListener('click', () => {
	startGame();
});

loadButton.addEventListener('click', () => {
	const gameState = getGameStateFromLocaleStorage();
	if(gameState === null) {
		return;
	}

	startGame(gameState);
});

newButton.addEventListener('click', () => {
	stopTimer();
	showMenu();
});

table.addEventListener('mousedown', (e) => {
	if(!gameRunning || !e.target.matches('td') || e.button !== 0) {
		return;
	}

	const tile = e.target;
	const x = tile.cellIndex;
	const y = tile.parentNode.rowIndex;

	board.hasRail(x, y) ? board.rotateRail(x, y) : board.placeRail(x, y);
	
	updateTile(tile);

	gliding = true;

	checkEnd();
});

document.addEventListener('mouseup', (e) => {
	gliding = false;
});

table.addEventListener('mouseover', (e) => {
	if(!gameRunning || !gliding || !e.target.matches('td')) {
		return;
	}

	const tile = e.target;
	const x = tile.cellIndex;
	const y = tile.parentNode.rowIndex;

	board.placeRail(x, y);

	updateTile(tile);
	
	checkEnd();
});

document.addEventListener('contextmenu', (e) => {
	if(!gameRunning || !e.target.matches('td')) {
		return;
	}
	
	const tile = e.target;
	const x = tile.cellIndex;
	const y = tile.parentNode.rowIndex;
	
	if(!board.hasRail(x, y)) {
		return;
	}
	
	contextMenuTile = tile;
	
	e.preventDefault();
	contextMenu.style.top = `${e.clientY}px`;
	contextMenu.style.left = `${e.clientX}px`;
	contextMenu.style.display = 'block';

	document.addEventListener('click', function () {
		contextMenu.style.display = 'none';
	}, {once: true});

	if(board.canCurve(x, y) && board.hasCurve(x, y)) {
		straightenButton.style.display = 'inline';
		curveButton.style.display = 'none';
	} else if(board.canCurve(x, y)) {
		straightenButton.style.display = 'none';
		curveButton.style.display = 'inline';
	} else {
		straightenButton.style.display = 'none';
		curveButton.style.display = 'none';
	}
});

straightenButton.addEventListener('click', (e) => {
	const x = contextMenuTile.cellIndex;
	const y = contextMenuTile.parentNode.rowIndex;
	board.curveRail(x, y);
	updateTile(contextMenuTile);
	checkEnd();
});

curveButton.addEventListener("click", (e) => {
	const x = contextMenuTile.cellIndex;
	const y = contextMenuTile.parentNode.rowIndex;
	board.curveRail(x, y);
	updateTile(contextMenuTile);
	checkEnd();
});

deleteButton.addEventListener("click", (e) => {
	const x = contextMenuTile.cellIndex;
	const y = contextMenuTile.parentNode.rowIndex;
	board.deleteRail(x, y);
	updateTile(contextMenuTile);
	checkEnd();
});

// start

showMenu();