class Board {
	#board;
	#difficulty
	#mapNumber
	constructor(difficulty) {
		this.#difficulty = difficulty;
		this.#board = this.generateBoard();
	}

	generateBoard() {
		const maps = this.#difficulty === Difficulty.Easy ? data.easy : data.hard;
		this.#mapNumber = Math.floor(Math.random() * maps.length); 
		const map = maps[this.#mapNumber];
		
		const board = map.map(row =>
			row.map(tile =>
				createTile(tile.tile, tile.orientation)
			)
		);

		return board;
	}

	hasRail(x, y) {
		return this.#board[y][x].hasRail();
	}

	hasCurve(x, y) {
		return this.#board[y][x].hasCurve();
	}

	canCurve(x, y) {
		return this.#board[y][x] instanceof Empty;
	}

	getClass(x, y) {
		return this.#board[y][x].getClass();
	}

	getDifficulty() {
		return this.#difficulty;
	}

	getMapNumber() {
		return this.#mapNumber;
	}

	toHTMLTable() {
		return `${this.#board.map(row => 
			`<tr>${row.map(tile => 
				`<td class="tile ${this.#difficulty === Difficulty.Easy ? 'easy' : 'hard'} ${tile.getClass()}"></td>`
			).join('')}</tr>`
		).join('')}`;
	}

	connected() {
		let n = this.#board.length;

		const getFirstOrDefault = (array, defaultValue = null) => {
			return array.length > 0 ? array[0] : defaultValue;
		};

		const getNeighbours = (current) => {
			const tile = current.tile;
			const y = current.y;
			const x = current.x;
			
			const neighbours = [];
			
			// north
			if(y > 0 &&
				this.hasRail(x, y) &&
				this.hasRail(x, y - 1) &&
				 [Orientation.Vertical, Orientation.NorthEast, Orientation.NorthWest].includes(tile.getOrientation()) &&
				 !(this.#board[y - 1][x] instanceof Oasis) &&
				 [Orientation.Vertical, Orientation.SouthEast, Orientation.SouthWest].includes(this.#board[y - 1][x].getOrientation())) {
				neighbours.push({tile: this.#board[y - 1][x], y: y - 1, x: x});
			}
			// east
			if(x < n - 1 &&
				this.hasRail(x, y) &&
				this.hasRail(x + 1, y) &&
				[Orientation.Horizontal, Orientation.NorthEast, Orientation.SouthEast].includes(tile.getOrientation()) &&
				!(this.#board[y][x + 1] instanceof Oasis) &&
				[Orientation.Horizontal, Orientation.NorthWest, Orientation.SouthWest].includes(this.#board[y][x + 1].getOrientation())) {
					neighbours.push({tile: this.#board[y][x + 1], y: y, x: x + 1});
			}
			// south
			if(y < n - 1 &&
				this.hasRail(x, y) &&
				this.hasRail(x, y + 1) &&
				[Orientation.Vertical, Orientation.SouthEast, Orientation.SouthWest].includes(tile.getOrientation()) &&
				!(this.#board[y + 1][x] instanceof Oasis) &&
				[Orientation.Vertical, Orientation.NorthEast, Orientation.NorthWest].includes(this.#board[y + 1][x].getOrientation())) {
					neighbours.push({tile: this.#board[y + 1][x], y: y + 1, x: x});
			}
			// west
			if(x > 0 &&
				this.hasRail(x, y) &&
				this.hasRail(x - 1, y) &&
				[Orientation.Horizontal, Orientation.NorthWest, Orientation.SouthWest].includes(tile.getOrientation()) &&
				!(this.#board[y][x - 1] instanceof Oasis) &&
				[Orientation.Horizontal, Orientation.NorthEast, Orientation.SouthEast].includes(this.#board[y][x - 1].getOrientation())) {
					neighbours.push({tile: this.#board[y][x - 1], y: y, x: x - 1});
			}

			return neighbours;
		};

		const start = getFirstOrDefault(this.#board.map((row, i) => row.map((e, j) => { return {'tile': e, 'y': i, 'x': j}; })).map(row => row.filter(e => e.tile.hasRail())).flat().filter(e => e.tile.hasRail()));

		if(start === null) {
			return false;
		}

		const visited = new Array(n).fill(null).map(() => new Array(n).fill(false));
		
		let previous = {x: -1, y: -1};
		let current = start;
		do {
			visited[current.y][current.x] = true;

			const reachedStart = getNeighbours(current).includes(e => e.x === start.x && e.y === start.y) && !(start.x === previous.x && start.y === previous.y);
			if(reachedStart) {
				break;
			}
			
			const neighbours = getNeighbours(current).filter(e => !visited[e.y][e.x]);
			previous = {x: current.x, y: current.y};
			current = getFirstOrDefault(neighbours);
		} while(current !== null);

		return this.#board.every((row, i) =>
			row.every((tile, j) => tile instanceof Oasis || visited[i][j])
		);
	}

	placeRail(x, y) {
		this.#board[y][x].placeRail();
	}

	rotateRail(x, y) {
		this.#board[y][x].rotateRail();
	}

	curveRail(x, y) {
		this.#board[y][x].curveRail();
	}

	deleteRail(x, y) {
		this.#board[y][x].deleteRail();
	}

	toJSON() {
		return {
			board: this.#board.map(row => row.map(tile => tile.toJSON())),
			difficulty: this.#difficulty,
			mapNumber: this.#mapNumber,
		};
	}

	static fromJSON(json) {
		const board = new Board(Difficulty.fromJSON(json.difficulty));
		board.#mapNumber = json.mapNumber;
		board.#board = json.board.map(row =>
			row.map(tileData => createTileFromJSON(tileData))
		);
		return board;
	}
}
