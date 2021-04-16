import Character from './Character';

export default class Bowman extends Character {
  constructor(level, type = 'bowman') {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
    this.stepRadius = 2;
    this.attackRadius = 2;
  }
}
