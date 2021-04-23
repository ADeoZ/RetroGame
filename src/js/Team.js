import { generateTeam, positionGenerator } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Characters/Bowman';
import Swordsman from './Characters/Swordsman';
import Magician from './Characters/Magician';

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

  add(positionedCharacter) {
    this.positioned.push(positionedCharacter);
  }

  levelUp(level) {
    const posGenerator = positionGenerator(this.startLines, 8);

    for (const member of this.positioned) {
      member.character.level += 1;
      member.character.attack = Math.floor(Math.max(
        member.character.attack,
        member.character.attack * (1.8 - (1 - member.character.health / 100)),
      ));
      member.character.defence = Math.floor(Math.max(
        member.character.defence,
        member.character.defence * (1.8 - (1 - member.character.health / 100)),
      ));
      member.character.health = member.character.health > 20 ? 100 : member.character.health + 80;

      member.position = posGenerator.next().value;
    }

    const countChar = level < 3 ? 1 : 2;
    const newMembers = generateTeam([...this.allowedTypes, new Magician()], level - 1, countChar);
    for (const member of newMembers) {
      member.attack = Math.floor(member.attack
         * ((1.8 - (1 - member.health / 100)) ** (member.level - 1)));
      member.defence = Math.floor(member.defence
         * ((1.8 - (1 - member.health / 100)) ** (member.level - 1)));
      this.add(new PositionedCharacter(member, posGenerator.next().value));
    }
  }
}
