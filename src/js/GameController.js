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
  }

  init() {
    this.gamePlay.drawUi('prairie');

    this.createTeam([new Bowman(), new Swordsman()], 1, 2, 'player');
    this.createTeam([new Daemon(), new Undead(), new Vampire()], 1, 2, 'enemy');

    this.gamePlay.redrawPositions([...this.playerPositions, ...this.enemyPositions]);

    this.addListeners();
  }

  createTeam(allowedTypes, level, characterCount, side) {
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

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    const characterOnIndex = this.playerPositions
      .find((character) => character.position === index);
    if (characterOnIndex !== undefined) {
      this.playerPositions.forEach((character) => this.gamePlay.deselectCell(character.position));
      this.gamePlay.selectCell(index);
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
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }
}
