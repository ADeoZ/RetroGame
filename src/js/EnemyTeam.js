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
    this.step(playerPositioned);
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

    const bestMove = EnemyTeam.bestMove(distances[0].member, distances[0].targetIndex, boardSize);
    for (let i = 0; i < bestMove.length; i += 1) {
      if ([...playerPositioned, ...this.positioned]
        .findIndex((character) => character.position === bestMove[i].stepIndex) < 0) {
        distances[0].member.position = bestMove[i].stepIndex;
        break;
      }
    }
  }

  static calcSteps(index, target, boardSize) {
    const vertical = Math.abs(
      Math.floor(index.position / boardSize) - Math.floor(target.position / boardSize),
    );
    const horizontal = Math.abs(
      Math.floor(index.position % boardSize) - Math.floor(target.position % boardSize),
    );
    const vertSteps = Math.ceil(
      (vertical - index.character.attackRadius) / index.character.stepRadius,
    );
    const horSteps = Math.ceil(
      (horizontal - index.character.attackRadius) / index.character.stepRadius,
    );
    if (vertSteps < horSteps) {
      return horSteps > 0 ? horSteps : 0;
    }
    return vertSteps > 0 ? vertSteps : 0;
  }

  static bestMove(index, target, boardSize) {
    const bestStep = [];
    index.stepCells.forEach((stepIndex) => {
      const vertical = Math.abs(
        Math.floor(stepIndex / boardSize) - Math.floor(target / boardSize),
      );
      const horizontal = Math.abs(
        Math.floor(stepIndex % boardSize) - Math.floor(target % boardSize),
      );
      bestStep.push({ stepIndex, result: vertical + horizontal - index.character.attackRadius });
    });
    return bestStep.sort((a, b) => a.result - b.result);
  }
}
