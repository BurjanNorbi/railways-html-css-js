class Orientation {
  static Vertical = new Orientation('Vertical');
  static Horizontal = new Orientation('Horizontal');
  static NorthSouth = new Orientation('NorthSouth');
  static NorthEast = new Orientation('NorthEast');
  static NorthWest = new Orientation('NorthWest');
  static SouthEast = new Orientation('SouthEast');
  static SouthWest = new Orientation('SouthWest');

  constructor(name) {
    this.name = name;
  }
  
	toString() {
    return `Orientation.${this.name}`;
  }

  toJSON() {
    return {
      type: 'Orientation',
      name: this.name
    };
  }

  static fromJSON(json) {
    if (json !== undefined && json.type === 'Orientation') {
      return Orientation[json.name] || new Orientation(json.name);
    }
  }  
}