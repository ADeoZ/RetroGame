export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

    // 'new Character' in code is prohibited
    if (new.target.name === 'Character') {
      throw new Error('Do not use new Character()');
    }
  }
}
