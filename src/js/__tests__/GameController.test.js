import GameController from '../GameController';
import GamePlay from '../GamePlay';
import PositionedCharacter from '../PositionedCharacter';
import Swordsman from '../Characters/Swordsman';
import Daemon from '../Characters/Daemon';

test('template literals', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add char on 12 cell and mouseover on it
  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 12));
  gameCtrl.onCellEnter(12);
  // expect show title of char characteristics
  expect(gamePlay.cells[12].title).toBe('🎖5 ⚔40 🛡10 ❤50');

  // mouseover on empty cell
  gameCtrl.onCellEnter(11);
  expect(gamePlay.cells[11].title).toBe('');
});

test('onCellEnter Teammate', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add 2 player chars
  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 12));
  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(1), 35));
  // click on first and mouseover on second
  gameCtrl.onCellClick(12);
  gameCtrl.onCellEnter(35);

  // first selected by yellow, cursor for second change into pointer
  expect([...gamePlay.cells[12].classList]).toEqual(expect.arrayContaining(['selected-yellow']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('onCellEnter Enemy', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add one player and one enemy chars
  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 12));
  gameCtrl.enemyTeam.add(new PositionedCharacter(new Daemon(1), 13));
  // click on player and mouseover on enemy
  gameCtrl.onCellClick(12);
  gameCtrl.onCellEnter(13);

  // cursor for enemy change into crosshair and adding red circle around it
  expect([...gamePlay.cells[13].classList]).toEqual(expect.arrayContaining(['selected-red']));
  expect(gamePlay.boardEl.style.cursor).toBe('crosshair');
});

test('onCellEnter Step', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add char on 12 cell, select it and mouseover on next cell
  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 12));
  gameCtrl.onCellClick(12);
  gameCtrl.onCellEnter(13);

  // cursor change into pointer and adding green circle around cell
  expect([...gamePlay.cells[13].classList]).toEqual(expect.arrayContaining(['selected-green']));
  expect(gamePlay.boardEl.style.cursor).toBe('pointer');
});

test('onCellEnter Not-allowed', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const gameCtrl = new GameController(gamePlay, {});
  gameCtrl.init();

  // add char on 12 cell, select it and mouseover on far cell
  gameCtrl.playerTeam.add(new PositionedCharacter(new Swordsman(5), 12));
  gameCtrl.onCellClick(12);
  gameCtrl.onCellEnter(35);

  // cursor change into not-allowed
  expect([...gamePlay.cells[35].classList]).not.toEqual(expect.arrayContaining(['selected-green']));
  expect(gamePlay.boardEl.style.cursor).toBe('not-allowed');
});
