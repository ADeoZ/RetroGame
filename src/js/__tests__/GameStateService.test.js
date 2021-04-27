import GameController from '../GameController';
import GamePlay from '../GamePlay';
import GameStateService from '../GameStateService';

jest.mock('../GameStateService');
jest.mock('../GamePlay');

test('load state error handling', () => {
  // create game
  const gamePlay = new GamePlay();
  const container = document.createElement('div');
  container.outerHTML = '<div id="game-container"></div>';
  gamePlay.bindToDOM(container);
  const stateService = new GameStateService(localStorage);
  const gameCtrl = new GameController(gamePlay, stateService);
  gameCtrl.init();

  // mock => return error oт load() call
  stateService.load.mockImplementation(() => {
    throw new Error('Invalid state');
  });

  // try to load game
  gameCtrl.onLoadGameClick();

  // expect load() called once, show error by GamePlay.showError()
  expect(stateService.load).toBeCalledTimes(1);
  expect(GamePlay.showError).toBeCalledTimes(1);
  expect(GamePlay.showError).toBeCalledWith('Invalid state');
});
