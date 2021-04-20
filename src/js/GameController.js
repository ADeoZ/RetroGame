import GamePlay from './GamePlay';
import Team from './Team';
import EnemyTeam from './EnemyTeam';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTeam = new Team();
    this.enemyTeam = new EnemyTeam();
    this.selectedCharacter = 0;
    this.turn = 0; // 0 - player, 1 - enemy
  }

  init() {
    this.gamePlay.drawUi('prairie');

    this.playerTeam.init();
    this.enemyTeam.init();

    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);

    this.addListeners();
  }

  checkCell(index) {
    if (this.selectedCharacter.position === index) {
      return { action: 'self', cursor: 'auto' };
    }
    // select teammate
    if (this.playerTeam.positioned.find((character) => character.position === index)) {
      return { action: 'team', cursor: 'pointer' };
    }
    // attack enemy
    if (this.selectedCharacter.attackCells.includes(index)
      && this.enemyTeam.positioned.find((character) => character.position === index)) {
      return { action: 'attack', cursor: 'crosshair', color: 'red' };
    }
    // step
    if (this.selectedCharacter.stepCells.includes(index)) {
      return { action: 'step', cursor: 'pointer', color: 'green' };
    }
    return { action: 'not', cursor: 'not-allowed' };
  }

  changeTurn(index) {
    this.gamePlay.deselectCell(this.selectedCharacter.position);
    this.gamePlay.deselectCell(index);
    this.selectedCharacter = 0;
    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);
    this.turn = 1 - this.turn;

    // enemyTeam turn
    const enemyAttack = this.enemyTeam.turn(this.playerTeam.positioned);
    if (enemyAttack) {
      this.gamePlay.selectCell(enemyAttack.index);
      this.gamePlay.selectCell(enemyAttack.attackIndex, 'red');
      const promise = this.attack(enemyAttack.index, enemyAttack.attackIndex);
      promise.then(() => {
        this.gamePlay.redrawPositions(
          [...this.playerTeam.positioned, ...this.enemyTeam.positioned],
        );
        this.gamePlay.deselectCell(enemyAttack.index);
        this.gamePlay.deselectCell(enemyAttack.attackIndex);
      });
    } else {
      this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);
    }
    this.turn = 1 - this.turn;
  }

  attack(index, attackIndex) {
    return new Promise((resolve) => {
      const attacker = [...this.playerTeam.positioned, ...this.enemyTeam.positioned]
        .find((character) => character.position === index);
      const victim = [...this.playerTeam.positioned, ...this.enemyTeam.positioned]
        .find((character) => character.position === attackIndex);
      const damage = Math.max(
        attacker.character.attack - victim.character.defence,
        attacker.character.attack * 0.1,
      );

      const promise = this.gamePlay.showDamage(attackIndex, damage);
      promise.then(() => {
        victim.character.health -= damage;
        if (victim.character.health <= 0) { // kill enemy
          if (this.enemyTeam.positioned.includes(victim)) {
            this.enemyTeam.positioned.splice(this.enemyTeam.positioned.indexOf(victim), 1);
          } else {
            this.playerTeam.positioned.splice(this.playerTeam.positioned.indexOf(victim), 1);
          }
        }
        resolve();
      });
    });
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
  }

  onCellClick(index) {
    if (!this.selectedCharacter || this.checkCell(index).action === 'team') { // select teammate
      const characterOnIndex = this.playerTeam.positioned
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
    } else if (this.checkCell(index).action === 'not') { // not allowed move
      GamePlay.showError('This move is not allowed!');
    } else if (this.checkCell(index).action === 'step') { // step move
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.selectedCharacter.position = index;
      this.changeTurn(index);
    } else if (this.checkCell(index).action === 'attack') { // attack
      const promise = this.attack(this.selectedCharacter.position, index);
      promise.then(() => this.changeTurn(index));
    }
  }

  onCellEnter(index) {
    const characterOnIndex = [...this.playerTeam.positioned, ...this.enemyTeam.positioned]
      .find((character) => character.position === index);
    if (characterOnIndex !== undefined) {
      this.gamePlay.showCellTooltip(`🎖${characterOnIndex.character.level} ⚔${characterOnIndex.character.attack} 🛡${characterOnIndex.character.defence} ❤${characterOnIndex.character.health}`, index);
    }

    if (this.selectedCharacter) {
      const selector = this.checkCell(index);
      if (selector.color) {
        this.gamePlay.selectCell(index, selector.color);
      }
      this.gamePlay.setCursor(selector.cursor);
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
