import { generateTeam, positionGenerator } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';

export default class Team {
  constructor() {
    this.positioned = [];
    // this.allowedTypes = [new Bowman(), new Swordsman()];
    this.allowedTypes = [new Bowman()];
    this.startLines = [0, 1];
  }

  init() {
    const members = generateTeam(this.allowedTypes, 1, 3);
    const posGenerator = positionGenerator(this.startLines, 8);
    members.forEach((member) => {
      this.positioned.push(new PositionedCharacter(member, posGenerator.next().value));
    });
    return this.positioned;
  }

  add(positionedCharacter) {
    this.positioned.push(positionedCharacter);
  }

  levelUp() {
    for (const member of this.positioned) {
      member.character.level += 1;
      member.character.health = member.character.health > 20 ? 100 : member.character.health + 80;
    }
  }
}
