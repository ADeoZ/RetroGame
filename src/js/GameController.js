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
      return ['', 'auto'];
    }
    // select teammate
    if (this.playerPositions.find((character) => character.position === index)) {
      return ['', 'pointer'];
    }
    // attack enemy
    if (this.selectedCharacter.attackCells.includes(index)
      && this.enemyPositions.find((character) => character.position === index)) {
      return ['red', 'crosshair'];
    }
    // step
    if (this.selectedCharacter.stepCells.includes(index)) {
      return ['green', 'pointer'];
    }
    return ['', 'not-allowed'];
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
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
  }

  onCellEnter(index) {
    const characterOnIndex = [...this.playerPositions, ...this.enemyPositions]
      .find((character) => character.position === index);
    if (characterOnIndex !== undefined) {
      this.gamePlay.showCellTooltip(`🎖${characterOnIndex.character.level} ⚔${characterOnIndex.character.attack} 🛡${characterOnIndex.character.defence} ❤${characterOnIndex.character.health}`, index);
    }

    if (this.selectedCharacter) {
      const selector = this.checkCell(index);
      if (selector[0] !== '') {
        this.gamePlay.selectCell(index, selector[0]);
      }
      this.gamePlay.setCursor(selector[1]);
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
