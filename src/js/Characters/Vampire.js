import Character from './Character';

export default class Vampire extends Character {
  constructor(level, type = 'vampire') {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
    this.stepRadius = 2;
    this.attackRadius = 2;
  }
}
