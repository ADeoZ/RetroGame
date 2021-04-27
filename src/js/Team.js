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
    // generate first team with 2 chars and level 1 on start lines
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
    // return chars on its start lines and add a new ones
    const posGenerator = positionGenerator(this.startLines, 8);

    // up attack and defence for all chars in team
    for (const member of this.positioned) {
      member.character.level += 1;

      // up only if health > 20%
      member.character.attack = +Math.floor(Math.max(
        member.character.attack,
        member.character.attack * (1.8 - (1 - member.character.health / 100)),
      )).toFixed(2);
      member.character.defence = +Math.floor(Math.max(
        member.character.defence,
        member.character.defence * (1.8 - (1 - member.character.health / 100)),
      )).toFixed(2);

      // restore health
      member.character.health = member.character.health > 20 ? 100 : member.character.health + 80;

      member.position = posGenerator.next().value;
    }

    // add 1 char on second level and 2 chars on the next
    const countChar = level < 3 ? 1 : 2;
    const newMembers = generateTeam([...this.allowedTypes, new Magician()], level - 1, countChar);
    // up attack and defence according to level
    for (const member of newMembers) {
      member.attack = Math.floor(member.attack
         * ((1.8 - (1 - member.health / 100)) ** (member.level - 1)));
      member.defence = Math.floor(member.defence
         * ((1.8 - (1 - member.health / 100)) ** (member.level - 1)));
      this.add(new PositionedCharacter(member, posGenerator.next().value));
    }
  }
}
