/**
 * Entry point of app: don't change this
 */
import GamePlay from './GamePlay';
import GameController from './GameController';
import GameStateService from './GameStateService';

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));

const stateService = new GameStateService(localStorage);

const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();

function bla(life) {
  return Math.max(50, 50 * (1.8 - life / 100));
}

console.log(bla(100));
console.log(bla(50));
console.log(bla(1));
console.log(bla(1));
console.log(bla(0.5));
console.log(bla(0.01));

// don't write your code here
