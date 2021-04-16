import GamePlay from './GamePlay';
import { generateTeam, positionGenerator } from './generators';
import Bowman from './Bowman';
import Swordsman from './Swordsman';
import Daemon from './Daemon';
import Undead from './Undead';
import Vampire from './Vampire';
import PositionedCharacter from './PositionedCharacter';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerPositions = [];
    this.enemyPositions = [];
    this.selectedCharacter = 0;
    this.turn = 0; // 0 - player, 1 - enemy
  }

  init() {
    this.gamePlay.drawUi('prairie');

    this.createTeam([new Bowman(), new Swordsman()], 1, 2, 'player');
    this.createTeam([new Daemon(), new Undead(), new Vampire()], 1, 2, 'enemy');

    this.gamePlay.redrawPositions([...this.playerPositions, ...this.enemyPositions]);

    this.addListeners();
  }

  createTeam(allowedTypes, level, characterCount, side) { // ? move to Team class ?
    const team = generateTeam(allowedTypes, level, characterCount);
    const lines = (side === 'player') ? [0, 1] : [6, 7];
    const posGenerator = positionGenerator(lines, 8);
    team.members.forEach((member) => {
      if (side === 'player') {
        this.playerPositions.push(new PositionedCharacter(member, posGenerator.next().value));
      } else {
        this.enemyPositions.push(new PositionedCharacter(member, posGenerator.next().value));
      }
    });
  }

  checkCell(index) {
    if (!(this.selectedCharacter instanceof PositionedCharacter)) {
      throw new Error('One of character must be selected!');
    }

    if (this.selectedCharacter.position === index) {
      return ['self', '', 'auto'];
    }
    // select teammate
    if (this.playerPositions.find((character) => character.position === index)) {
      return ['team', '', 'pointer'];
    }
    // attack enemy
    if (this.selectedCharacter.attackCells.includes(index)
      && this.enemyPositions.find((character) => character.position === index)) {
      return ['attack', 'red', 'crosshair'];
    }
    // step
    if (this.selectedCharacter.stepCells.includes(index)) {
      return ['step', 'green', 'pointer'];
    }
    return ['not', '', 'not-allowed'];
  }

  changeTurn(index) {
    this.gamePlay.deselectCell(this.selectedCharacter.position);
    this.gamePlay.deselectCell(index);
    this.selectedCharacter = 0;
    this.gamePlay.redrawPositions([...this.playerPositions, ...this.enemyPositions]);
    this.turn = 1 - this.turn;
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    if (!this.selectedCharacter || this.checkCell(index)[0] === 'team') {
      const characterOnIndex = this.playerPositions
        .find((character) => character.position === index);
      if (characterOnIndex !== undefined) {
        if (this.selectedCharacter) {
          this.gamePlay.deselectCell(this.selectedCharacter.position);
        }
        this.gamePlay.selectCell(index);
        this.selectedCharacter = characterOnIndex;
      } else {
        GamePlay.showError('Select your warrior!');
      }
    } else if (this.checkCell(index)[0] === 'not') {
      GamePlay.showError('This move is not allowed!');
    } else if (this.selectedCharacter && this.checkCell(index)[0] === 'step') {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.selectedCharacter.position = index;
      this.changeTurn(index);
    } else if (this.selectedCharacter && this.checkCell(index)[0] === 'attack') {
      const victim = this.enemyPositions
        .find((character) => character.position === index);
      const damage = Math.max(
        this.selectedCharacter.character.attack - victim.character.defence,
        this.selectedCharacter.character.attack * 0.1,
      );
      const promise = this.gamePlay.showDamage(index, damage);
      promise.then(() => {
        victim.character.health -= damage;
        if (victim.character.health <= 0) {
          this.enemyPositions.splice(this.enemyPositions.indexOf(victim), 1);
        }
        this.changeTurn(index);
      });
    }
  }

  onCellEnter(index) {
    const characterOnIndex = [...this.playerPositions, ...this.enemyPositions]
      .find((character) => character.position === index);
    if (characterOnIndex !== undefined) {
      this.gamePlay.showCellTooltip(`🎖${characterOnIndex.character.level} ⚔${characterOnIndex.character.attack} 🛡${characterOnIndex.character.defence} ❤${characterOnIndex.character.health}`, index);
    }

    if (this.selectedCharacter) {
      const selector = this.checkCell(index);
      if (selector[1] !== '') {
        this.gamePlay.selectCell(index, selector[1]);
      }
      this.gamePlay.setCursor(selector[2]);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
    this.gamePlay.setCursor('auto');
    if (this.selectedCharacter.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }
}
