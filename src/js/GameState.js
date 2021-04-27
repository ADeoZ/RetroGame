/**
* Current State of game
* keep the current turn, level, score, best score and teams
*/

import Bowman from './Characters/Bowman';
import Daemon from './Characters/Daemon';
import Magician from './Characters/Magician';
import Swordsman from './Characters/Swordsman';
import Undead from './Characters/Undead';
import Vampire from './Characters/Vampire';
import PositionedCharacter from './PositionedCharacter';

export default class GameState {
  constructor(turn, level, score, bestScore, player, enemy) {
    this.turn = turn;
    this.level = level;
    this.score = score;
    this.bestScore = bestScore;
    this.playerTeam = player;
    this.enemyTeam = enemy;
  }

  // restoring from load object
  from(object) {
    this.level = object.level;
    this.turn = object.turn;
    this.score = object.score;
    this.bestScore = object.bestScore;
    this.player = [];
    this.enemy = [];

    // since class names have been lost in JSON, restore them
    for (const anotherOne of object.player) {
      let newChar = 0;
      switch (anotherOne.type) {
        case 'swordsman':
          newChar = new Swordsman(anotherOne.member.character.level);
          break;
        case 'bowman':
          newChar = new Bowman(anotherOne.member.character.level);
          break;
        case 'magician':
          newChar = new Magician(anotherOne.member.character.level);
          break;
        default:
          throw new Error('It is not player classes!');
      }
      // copying stats of each character in new class instance
      for (const stats in anotherOne.member.character) {
        if ({}.hasOwnProperty.call(anotherOne.member.character, stats)) {
          newChar[stats] = anotherOne.member.character[stats];
        }
      }
      this.player.push(
        {
          type: anotherOne.type,
          member: new PositionedCharacter(newChar, anotherOne.member.position),
        },
      );
    }
    // since class names have been lost in JSON, restore them
    for (const anotherOne of object.enemy) {
      let newChar = 0;
      switch (anotherOne.type) {
        case 'vampire':
          newChar = new Vampire(anotherOne.member.character.level);
          break;
        case 'daemon':
          newChar = new Daemon(anotherOne.member.character.level);
          break;
        case 'undead':
          newChar = new Undead(anotherOne.member.character.level);
          break;
        default:
          throw new Error('It is not enemy classes!');
      }
      // copying stats of each character in new class instance
      for (const stats in anotherOne.member.character) {
        if ({}.hasOwnProperty.call(anotherOne.member.character, stats)) {
          newChar[stats] = anotherOne.member.character[stats];
        }
      }
      this.enemy.push(
        {
          type: anotherOne.type,
          member: new PositionedCharacter(newChar, anotherOne.member.position),
        },
      );
    }
  }

  // saving the type of each player`s character for restoring from JSON
  set playerTeam(positioned) {
    this.player = [];
    for (const member of positioned) {
      this.player.push({ type: member.character.type, member });
    }
  }

  // clear information of type character from object
  get playerTeam() {
    return this.player.map((anotherOne) => anotherOne.member);
  }

  // saving the type of each enemy`s character for restoring from JSON
  set enemyTeam(positioned) {
    this.enemy = [];
    for (const member of positioned) {
      this.enemy.push({ type: member.character.type, member });
    }
  }

  // clear information of type character from object
  get enemyTeam() {
    return this.enemy.map((anotherOne) => anotherOne.member);
  }
}
