import GameController from '../GameController';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';
import Swordsman from '../Characters/Swordsman';
import Daemon from '../Characters/Daemon';

test('template literals', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);

  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 9));
  gameCtrl.onCellEnter(9);
  expect(gamePlay.cells[9].title).toBe('🎖5 ⚔40 🛡10 ❤50');

  gameCtrl.onCellEnter(8);
  expect(gamePlay.cells[8].title).toBe('');
});

test('onCellEnter Teammate', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);

  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 0));
  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(1), 3));
  gameCtrl.onCellClick(0);
  gameCtrl.onCellEnter(3);
  expect([...gamePlay.cells[0].classList]).toEqual(expect.arrayContaining(['selected-yellow']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('onCellEnter Enemy', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);

  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 0));
  gameCtrl.enemyTeam.add(new PositionedCharacter(new Daemon(1), 1));
  gameCtrl.onCellClick(0);
  gameCtrl.onCellEnter(1);
  expect([...gamePlay.cells[1].classList]).toEqual(expect.arrayContaining(['selected-red']));
  expect(gamePlay.boardEl.style.cursor).toBe('crosshair');
});

test('onCellEnter Step', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);

  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 0));
  gameCtrl.onCellClick(0);
  gameCtrl.onCellEnter(1);
  expect([...gamePlay.cells[1].classList]).toEqual(expect.arrayContaining(['selected-green']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('onCellEnter Not-allowed', () => {
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);

  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 0));
  gameCtrl.onCellClick(0);
  gameCtrl.onCellEnter(6);
  expect([...gamePlay.cells[1].classList]).not.toEqual(expect.arrayContaining(['selected-green']));
  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
});
