import { generateTeam, positionGenerator } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Bowman';
import Swordsman from './Swordsman';

export default class Team {
  constructor() {
    this.positioned = [];
    this.allowedTypes = [new Bowman(), new Swordsman()];
    this.startLines = [0, 1];
  }

  init() {
    const members = generateTeam(this.allowedTypes, 1, 2);
    const posGenerator = positionGenerator(this.startLines, 8);
    members.forEach((member) => {
      this.positioned.push(new PositionedCharacter(member, posGenerator.next().value));
    });
    return this.positioned;
  }
}
