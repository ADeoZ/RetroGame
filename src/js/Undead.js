import Character from './Character';

export default class Undead extends Character {
  constructor(level, type = 'Undead') {
    super(level, type);
    this.attack = 40;
    this.defence = 10;
  }
}
