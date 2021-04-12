export default class Team {
  constructor() {
    this.members = [];
  }

  add(character) {
    this.members.push(character);
  }

  toArray() {
    return Array.from(this.members.values());
  }
}
