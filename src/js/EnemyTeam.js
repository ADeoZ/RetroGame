/**
* Enemy team chars,
* artificial intelligence logic: attack and steps
* Extends Team Class
*/

import Team from './Team';
import { generateTeam, positionGenerator } from './generators';
import PositionedCharacter from './PositionedCharacter';
import Daemon from './Characters/Daemon';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';

export default class EnemyTeam extends Team {
  constructor() {
    super();
    this.allowedTypes = [new Daemon(), new Undead(), new Vampire()];
    this.startLines = [6, 7];
  }

  // move: attack if can or step
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
      // find all chars can be attacked
      canAttack.push(playerPositioned.filter(
        (character) => member.attackCells.includes(character.position),
      // calc possible damage for all chars can be attacked
      ).map((attacked) => {
        const damage = Math.max(
          member.character.attack - attacked.character.defence,
          member.character.attack * 0.1,
        );
        return {
          index: member.position,
          attackIndex: attacked.position,
          // calc coef: how many hit to kill it
          coef: attacked.character.health / damage,
        };
      }));
    });

    // choose the strongest damage
    const bestAttack = [].concat(...canAttack).sort((a, b) => a.coef - b.coef);
    return bestAttack[0];
  }

  step(playerPositioned) {
    const boardSize = 8;
    const distances = [];

    // array of possible steps for all chars in enemy team
    this.positioned.forEach((member) => {
      playerPositioned.forEach((character) => {
        distances.push({
          member,
          targetIndex: character.position,
          distance: EnemyTeam.calcSteps(member, character, boardSize),
        });
      });
    });

    // sort by shortest distance or by attack power if distance is equal
    distances.sort((a, b) => {
      if (a.distance < b.distance) return -1;
      if (a.distance > b.distance) return 1;
      // if distance equal
      if (a.member.character.attack > b.member.character.attack) return -1;
      if (a.member.character.attack < b.member.character.attack) return 1;
      return 0;
    });

    // calc the best move to target char
    const bestMove = EnemyTeam.bestMove(distances[0].member, distances[0].targetIndex, boardSize);
    for (let i = 0; i < bestMove.length; i += 1) {
      // if there`s no char at the end of path then move or try next best move
      if ([...playerPositioned, ...this.positioned]
        .findIndex((character) => character.position === bestMove[i].stepIndex) < 0) {
        distances[0].member.position = bestMove[i].stepIndex;
        break;
      }
    }
  }

  static calcSteps(index, target, boardSize) {
    // calc the difference between vertical and horizontal lines for target
    const vertical = Math.abs(
      Math.floor(index.position / boardSize) - Math.floor(target.position / boardSize),
    );
    const horizontal = Math.abs(
      Math.floor(index.position % boardSize) - Math.floor(target.position % boardSize),
    );
    // calc count of steps to enter in attack radius
    const vertSteps = Math.ceil(
      (vertical - index.character.attackRadius) / index.character.stepRadius,
    );
    const horSteps = Math.ceil(
      (horizontal - index.character.attackRadius) / index.character.stepRadius,
    );
    // considering diagonal
    if (vertSteps < horSteps) {
      return horSteps > 0 ? horSteps : 0;
    }
    return vertSteps > 0 ? vertSteps : 0;
  }

  static bestMove(index, target, boardSize) {
    // calc which of possible steps will be closer to target
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

  // levelUp() changes the original one in the class prototype
  levelUp(level, countChar) {
    // generate new team on start lines
    const posGenerator = positionGenerator(this.startLines, 8);
    const newMembers = generateTeam(this.allowedTypes, level, countChar);

    // strengthen chars in accordance with level
    for (const member of newMembers) {
      member.attack = Math.floor(member.attack
         * ((1.8 - (1 - member.health / 100)) ** (member.level - 1)));
      member.defence = Math.floor(member.defence
         * ((1.8 - (1 - member.health / 100)) ** (member.level - 1)));
      this.add(new PositionedCharacter(member, posGenerator.next().value));
    }
  }
}
