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
    this.posCharacters = [];
  }

  init() {
    this.gamePlay.drawUi('prairie');

    const playerTeam = generateTeam([new Bowman(), new Swordsman()], 1, 2);
    const playerPosGenerator = positionGenerator([0, 1], 8);
    playerTeam.members.forEach((member) => {
      this.posCharacters.push(new PositionedCharacter(member, playerPosGenerator.next().value));
    });

    const enemyTeam = generateTeam([new Daemon(), new Undead(), new Vampire()], 1, 2);
    const enemyPosGenerator = positionGenerator([6, 7], 8);
    enemyTeam.members.forEach((member) => {
      this.posCharacters.push(new PositionedCharacter(member, enemyPosGenerator.next().value));
    });

    this.gamePlay.redrawPositions(this.posCharacters);

    this.addListeners();
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {

  }

  onCellEnter(index) {
    const characterOnIndex = this.posCharacters.find((character) => character.position === index);
    if (characterOnIndex !== undefined) {
      this.gamePlay.showCellTooltip(`🎖${characterOnIndex.character.level} ⚔${characterOnIndex.character.attack} 🛡${characterOnIndex.character.defence} ❤${characterOnIndex.character.health}`, index);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);
  }
}
