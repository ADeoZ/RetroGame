import Character from './Character';

export default class Magician extends Character {
  constructor(level, type = 'Magician') {
    super(level, type);
    this.attack = 10;
    this.defence = 40;
  }
}
