import Team from './Team';
import Daemon from './Daemon';
import Undead from './Undead';
import Vampire from './Vampire';

export default class EnemyTeam extends Team {
  constructor() {
    super();
    this.allowedTypes = [new Daemon(), new Undead(), new Vampire()];
    this.startLines = [3, 4];
  }

  turn(playerPositioned) {
    if (this.attack(playerPositioned)) {
      return this.attack(playerPositioned);
    }
    // this.step(playerPositioned);
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

  step(playerPositioned) {
    const boardSize = 8;
    const distances = [];
    this.positioned.forEach((member) => {
      playerPositioned.forEach((character) => {
        distances.push({
          member,
          targetIndex: character.position,
          distance: EnemyTeam.calcSteps(member, character, boardSize),
        });
      });
    });

    distances.sort((a, b) => {
      if (a.distance < b.distance) return -1;
      if (a.distance > b.distance) return 1;
      // if distance equal
      if (a.member.character.attack > b.member.character.attack) return -1;
      if (a.member.character.attack < b.member.character.attack) return 1;
      return 0;
    });

    return null;
  }

  static calcSteps(index, target, boardSize) {
    const vertical = Math.abs(
      Math.floor(index.position / boardSize) - Math.floor(target.position / boardSize),
    );
    const horizontal = Math.abs(
      Math.floor(index.position % boardSize) - Math.floor(target.position % boardSize),
    );
    const vertStep = vertical - index.character.attackRadius > 0
      ? vertical - index.character.attackRadius : 0;

    let horStep = 0;
    if (vertStep === 0) {
      horStep = horizontal - index.character.attackRadius;
    } else {
      horStep = horizontal - vertical - index.character.attackRadius + 1;
    }
    horStep = horStep > 0 ? horStep : 0;

    // return vertical + diag - index.character.attackRadius >= 0
    //   ? vertical + diag - index.character.attackRadius : 0;

    return Math.ceil(vertStep / index.character.stepRadius)
     + Math.ceil(horStep / index.character.stepRadius);
  }
}
