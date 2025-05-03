class Difficulty {
  static Easy = new Difficulty('Easy');
  static Hard = new Difficulty('Hard');

  constructor(name) {
    this.name = name;
  }
  
	toString() {
    return `Difficulty.${this.name}`;
  }

  toJSON() {
    return {
      type: 'Difficulty',
      name: this.name
    };
  }

  static fromJSON(json) {
    if (json.type === 'Difficulty') {
      return Difficulty[json.name] || new Difficulty(json.name);
    }
  }
}