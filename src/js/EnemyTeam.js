import Team from './Team';
import Daemon from './Daemon';
import Undead from './Undead';
import Vampire from './Vampire';

export default class EnemyTeam extends Team {
  constructor() {
    super();
    this.allowedTypes = [new Daemon(), new Undead(), new Vampire()];
    this.startLines = [6, 7];
  }

  turn(playerPositioned) {
    if (this.attack(playerPositioned)) {
      return this.attack(playerPositioned);
    }
    return null;
  }

  attack(playerPositioned) {
    const canAttack = [];

    this.positioned.forEach((member) => {
      canAttack.push(playerPositioned.filter(
        (character) => member.attackCells.includes(character.position), // chars can be attacked
      ).map((attacked) => {
        const damage = Math.max(
          member.character.attack - attacked.character.defence,
          member.character.attack * 0.1,
        );
        return {
          index: member.position,
          attackIndex: attacked.position,
          coef: attacked.character.health / damage, // how many hit to kill
        };
      }));
    });

    const bestAttack = [].concat(...canAttack).sort((a, b) => a.coef - b.coef);
    return bestAttack[0];
  }
}
