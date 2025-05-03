class Oasis {
	getClass() {
		return 'tile-oasis';
	}

	hasRail() { return false; }
	rotateRail() {}
	placeRail() {}
	deleteRail() {}
	curveRail() {}

	toJSON() {
		return { type: 'Oasis' };
	}

	static fromJSON() {
		return new Oasis();
	}
}

class Empty {
	#hasRail;
	#hasCurve;
	#orientation;

	constructor() {
		this.#hasRail = false;
		this.#hasCurve = false;
	}

	getClass() {
		if(!this.#hasRail) {
			return 'tile-empty';
		}

		switch (this.#orientation) {
			case Orientation.Vertical:   return `tile-rail-v`;
			case Orientation.Horizontal: return `tile-rail-h`;
			case Orientation.NorthEast:   return `tile-curve-rail-ne`;
			case Orientation.NorthWest:   return `tile-curve-rail-nw`;
			case Orientation.SouthEast:  return `tile-curve-rail-se`;
			case Orientation.SouthWest:  return `tile-curve-rail-sw`;
		}
	}
	getOrientation() { return this.#orientation; }

	hasRail() { return this.#hasRail; }
	hasCurve() { return this.#hasCurve; }
	rotateRail() {
		switch (this.#orientation) {
			case Orientation.Vertical: this.#orientation = Orientation.Horizontal; break;
			case Orientation.Horizontal: this.#orientation = Orientation.Vertical; break;
			case Orientation.NorthWest: this.#orientation = Orientation.NorthEast; break;
			case Orientation.NorthEast: this.#orientation = Orientation.SouthEast; break;
			case Orientation.SouthEast: this.#orientation = Orientation.SouthWest; break;
			case Orientation.SouthWest: this.#orientation = Orientation.NorthWest; break;
		}
	}
	placeRail() { this.#hasRail = true; this.#orientation = Orientation.Vertical; }
	deleteRail() { this.#hasRail = false; this.#hasCurve = false; }
	curveRail() {
		this.#orientation = this.#hasCurve ? Orientation.Vertical : Orientation.NorthWest;
		this.#hasCurve = !this.#hasCurve;
	}

	toJSON() {
		return {
			type: 'Empty',
			hasRail: this.#hasRail,
			hasCurve: this.#hasCurve,
			orientation: this.#orientation
		};
	}

	static fromJSON(json) {
		const emptyTile = new Empty();
		emptyTile.#hasRail = json.hasRail;
		emptyTile.#hasCurve = json.hasCurve;
		emptyTile.#orientation = Orientation.fromJSON(json.orientation);
		return emptyTile;
	}
}

class Mountain {
	#hasRail;
	#orientation;
	constructor(orientation) {
		this.#hasRail = false;
		this.#orientation = orientation;
	}
	
	getClass() {
		switch (this.#orientation) {
			case Orientation.NorthEast: return `tile-mountain${this.#hasRail ? '-rail' : ''}-ne`;
			case Orientation.NorthWest: return `tile-mountain${this.#hasRail ? '-rail' : ''}-nw`;
			case Orientation.SouthEast: return `tile-mountain${this.#hasRail ? '-rail' : ''}-se`;
			case Orientation.SouthWest: return `tile-mountain${this.#hasRail ? '-rail' : ''}-sw`;
		}
	}
	getOrientation() { return this.#orientation; }
	
	hasRail() { return this.#hasRail; }
	rotateRail() {}
	placeRail() { this.#hasRail = true; }
	deleteRail() { this.#hasRail = false; }
	curveRail() {}

	toJSON() {
		return {
			type: 'Mountain',
			hasRail: this.#hasRail,
			orientation: this.#orientation
		};
	}

	static fromJSON(json) {
		const mountainTile = new Mountain(Orientation.fromJSON(json.orientation));
		mountainTile.#hasRail = json.hasRail;
		return mountainTile;
	}
}

class Bridge {
	#hasRail;
	#orientation;

	constructor(orientation) {
		this.#hasRail = false;
		this.#orientation = orientation;
	}

	getClass() {
		switch (this.#orientation) {
			case Orientation.Vertical: return `tile-bridge${this.#hasRail ? '-rail' : ''}-v`;
			case Orientation.Horizontal: return `tile-bridge${this.#hasRail ? '-rail' : ''}-h`;
		}
	}
	getOrientation() { return this.#orientation; }
	
	hasRail() { return this.#hasRail; }
	rotateRail() {}
	placeRail() { this.#hasRail = true; }
	deleteRail() { this.#hasRail = false; }
	curveRail() {}

	toJSON() {
		return {
			type: 'Bridge',
			hasRail: this.#hasRail,
			orientation: this.#orientation
		};
	}

	static fromJSON(json) {
		const bridgeTile = new Bridge(Orientation.fromJSON(json.orientation));
		bridgeTile.#hasRail = json.hasRail;
		return bridgeTile;
	}
}

function createTile(tile, orientation) {
	switch (tile) {
		case 'Empty': return new Empty();
		case 'Oasis': return new Oasis();
		case 'Mountain': return new Mountain(orientation === 'NorthEast' ? Orientation.NorthEast : (orientation === 'NorthWest' ? Orientation.NorthWest : (orientation === 'SouthEast' ? Orientation.SouthEast : Orientation.SouthWest)));
		case 'Bridge': return new Bridge(orientation === 'Vertical' ? Orientation.Vertical : Orientation.Horizontal);
	}
}

function createTileFromJSON(json) {
	switch (json.type) {
		case 'Empty': return Empty.fromJSON(json);
		case 'Oasis': return Oasis.fromJSON(json);
		case 'Mountain': return Mountain.fromJSON(json);
		case 'Bridge': return Bridge.fromJSON(json);
	}
}