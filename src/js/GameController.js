import GamePlay from './GamePlay';
import GameState from './GameState';
import themes from './themes';
import Team from './Team';
import EnemyTeam from './EnemyTeam';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.playerTeam = new Team();
    this.enemyTeam = new EnemyTeam();
    this.selectedCharacter = 0;
  }

  init() {
    // create first teams and positioning it
    this.playerTeam.init();
    this.enemyTeam.init();

    // create game state object: (turn, level, score, best score, player team, enemy team)
    const bestScore = this.state !== undefined ? this.state.bestScore : 0;
    this.state = new GameState(
      0, 0, 0, bestScore, this.playerTeam.positioned, this.enemyTeam.positioned,
    );

    // draw board and characters
    this.gamePlay.drawUi(themes[this.state.level % 4]);
    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);
    this.gamePlay.setBestScore(this.state.bestScore);

    this.addListeners();
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onCellClick(index) {
    // only if player turn
    if (this.state.turn === 0) {
      // if char is selected and click on another char from your team -> select teammate
      if (!this.selectedCharacter || this.checkCell(index).action === 'team') {
        const characterOnIndex = this.playerTeam.positioned
          .find((character) => character.position === index);
        if (characterOnIndex !== undefined) {
          if (this.selectedCharacter) {
            this.gamePlay.deselectCell(this.selectedCharacter.position);
          }
          this.gamePlay.selectCell(index);
          this.selectedCharacter = characterOnIndex;
        } else {
          GamePlay.showMessage('Select your warrior!');
        }
      // not allowed move
      } else if (this.checkCell(index).action === 'not') {
        GamePlay.showMessage('This move is not allowed!');
      // step move
      } else if (this.checkCell(index).action === 'step') {
        this.gamePlay.deselectCell(this.selectedCharacter.position);
        this.selectedCharacter.position = index;
        this.changeTurn(index);
      // attack move
      } else if (this.checkCell(index).action === 'attack') {
        const promise = this.attack(this.selectedCharacter.position, index);
        promise.then(() => this.changeTurn(index));
      }
    }
  }

  onCellEnter(index) {
    // show tooltip for any chars on board
    const characterOnIndex = [...this.playerTeam.positioned, ...this.enemyTeam.positioned]
      .find((character) => character.position === index);
    if (characterOnIndex !== undefined) {
      this.gamePlay.showCellTooltip(`🎖${characterOnIndex.character.level} ⚔${characterOnIndex.character.attack} 🛡${characterOnIndex.character.defence} ❤${+characterOnIndex.character.health.toFixed(2)}`, index);
    }

    // if some char is selected change selector and cursor for cells when mouseover
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

  onNewGameClick() {
    // reset all teams, listeners and create new game
    this.playerTeam.positioned = [];
    this.enemyTeam.positioned = [];
    this.selectedCharacter = 0;
    this.gamePlay.cellClickListeners = [];
    this.gamePlay.cellEnterListeners = [];
    this.gamePlay.cellLeaveListeners = [];
    this.gamePlay.newGameListeners = [];
    this.gamePlay.saveGameListeners = [];
    this.gamePlay.loadGameListeners = [];
    this.init();
  }

  onSaveGameClick() {
    // convert teams into state object and save game
    this.state.playerTeam = this.playerTeam.positioned;
    this.state.enemyTeam = this.enemyTeam.positioned;
    this.stateService.save(this.state);
    GamePlay.showMessage('Game saved!');
  }

  onLoadGameClick() {
    try {
      this.state.from(this.stateService.load());
    } catch (e) {
      GamePlay.showError(e.message);
    }
    // conver teams from state object
    this.playerTeam.positioned = this.state.playerTeam;
    this.enemyTeam.positioned = this.state.enemyTeam;

    // draw board and characters
    this.gamePlay.drawUi(themes[this.state.level % 4]);
    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);
    this.gamePlay.setScore(this.state.score);
    this.gamePlay.setBestScore(this.state.bestScore);
    this.gamePlay.setLevel(this.state.level);
  }

  checkCell(index) {
    // if character itself on cell
    if (this.selectedCharacter.position === index) {
      return { action: 'self', cursor: 'auto' };
    }
    // if teammate on cell
    if (this.playerTeam.positioned.find((character) => character.position === index)) {
      return { action: 'team', cursor: 'pointer' };
    }
    // if enemy on cell and it possible for attack for selected char
    if (this.selectedCharacter.attackCells.includes(index)
      && this.enemyTeam.positioned.find((character) => character.position === index)) {
      return { action: 'attack', cursor: 'crosshair', color: 'red' };
    }
    // if no enemy on cell and it possible to step on this cell for selected char
    if (this.selectedCharacter.stepCells.includes(index)
    && !this.enemyTeam.positioned.find((character) => character.position === index)) {
      return { action: 'step', cursor: 'pointer', color: 'green' };
    }
    // not allowed for all rest
    return { action: 'not', cursor: 'not-allowed' };
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

        // kill enemy and remove from team
        if (victim.character.health <= 0) {
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

  changeTurn(index) {
    this.gamePlay.deselectCell(this.selectedCharacter.position);
    this.gamePlay.deselectCell(index);
    this.selectedCharacter = 0;
    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);

    // if kill all enemy -> next level
    if (this.enemyTeam.positioned.length === 0) {
      this.levelUp();
    } else {
      this.state.turn = 1 - this.state.turn;
    }

    // if enemyTeam turn
    if (this.state.turn === 1) {
      const enemyAttack = this.enemyTeam.turn(this.playerTeam.positioned);
      // if enemy decided to attack
      if (enemyAttack) {
        // show attacker, target and damage
        this.gamePlay.selectCell(enemyAttack.index);
        this.gamePlay.selectCell(enemyAttack.attackIndex, 'red');
        const promise = this.attack(enemyAttack.index, enemyAttack.attackIndex);
        promise.then(() => {
          this.gamePlay.redrawPositions(
            [...this.playerTeam.positioned, ...this.enemyTeam.positioned],
          );
          this.gamePlay.deselectCell(enemyAttack.index);
          this.gamePlay.deselectCell(enemyAttack.attackIndex);

          // if kill all players chars
          if (this.playerTeam.positioned.length === 0) {
            GamePlay.showMessage('You died!');
          } else {
            this.state.turn = 1 - this.state.turn;
          }
        });
      // if enemy decided to make a step
      } else {
        this.gamePlay.redrawPositions(
          [...this.playerTeam.positioned, ...this.enemyTeam.positioned],
        );
        this.state.turn = 1 - this.state.turn;
      }
    }
  }

  levelUp() {
    // change level
    this.state.level += 1;
    this.gamePlay.drawUi(themes[this.state.level % 4]);

    // renew the score and best score
    this.state.score += this.playerTeam.positioned.reduce(
      (sum, member) => sum + member.character.health, 0,
    );
    if (this.state.bestScore < this.state.score) {
      this.state.bestScore = this.state.score;
    }
    this.gamePlay.setScore(this.state.score);
    this.gamePlay.setBestScore(this.state.bestScore);
    this.gamePlay.setLevel(this.state.level);

    // up level for player team and create new enemy team
    this.playerTeam.levelUp(this.state.level + 1);
    this.enemyTeam.levelUp(this.state.level + 1, this.playerTeam.positioned.length);

    this.gamePlay.redrawPositions([...this.playerTeam.positioned, ...this.enemyTeam.positioned]);
  }
}
