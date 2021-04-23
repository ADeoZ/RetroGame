import Character from './Characters/Character';

export default class PositionedCharacter {
  constructor(character, position) {
    if (!(character instanceof Character)) {
      throw new Error('character must be instance of Character or its children');
    }

    if (typeof position !== 'number') {
      throw new Error('position must be a number');
    }

    this.character = character;
    this.position = position;
  }

  get stepCells() {
    const boardSize = 8;
    const stepsArray = [this.position];
    const positionLine = this.position % boardSize;
    for (let i = 1; i <= this.character.stepRadius; i += 1) {
      const top = this.position - boardSize * i;
      const topRight = this.position - boardSize * i + i;
      const right = this.position + 1 * i;
      const bottomRight = this.position + boardSize * i + i;
      const bottom = this.position + boardSize * i;
      const bottomLeft = this.position + boardSize * i - i;
      const left = this.position - 1 * i;
      const topLeft = this.position - boardSize * i - i;

      if (top >= 0) {
        stepsArray.push(top);
      }
      if (topRight % boardSize > positionLine && topRight >= 0) {
        stepsArray.push(topRight);
      }
      if (right % boardSize > positionLine && left < boardSize ** 2) {
        stepsArray.push(right);
      }
      if (bottomRight % boardSize > positionLine && bottomRight < boardSize ** 2) {
        stepsArray.push(bottomRight);
      }
      if (bottom < boardSize ** 2) {
        stepsArray.push(bottom);
      }
      if (bottomLeft % boardSize < positionLine && bottomLeft < boardSize ** 2) {
        stepsArray.push(bottomLeft);
      }
      if (left % boardSize < positionLine && left >= 0) {
        stepsArray.push(left);
      }
      if (topLeft % boardSize < positionLine && topLeft >= 0) {
        stepsArray.push(topLeft);
      }
    }

    return stepsArray;
  }

  get attackCells() {
    const boardSize = 8;
    const attackArray = [];
    const rowStart = Math.floor(this.position / boardSize) - this.character.attackRadius >= 0
      ? Math.floor(this.position / boardSize) - this.character.attackRadius : 0;
    const rowEnd = Math.floor(this.position / boardSize) + this.character.attackRadius < boardSize
      ? Math.floor(this.position / boardSize) + this.character.attackRadius : boardSize - 1;
    const lineStart = (this.position % boardSize) - this.character.attackRadius >= 0
      ? (this.position % boardSize) - this.character.attackRadius : 0;
    const lineEnd = (this.position % boardSize) + this.character.attackRadius < boardSize
      ? (this.position % boardSize) + this.character.attackRadius : boardSize - 1;

    for (let i = rowStart; i <= rowEnd; i += 1) {
      for (let j = lineStart; j <= lineEnd; j += 1) {
        attackArray.push(i * boardSize + j);
      }
    }
    return attackArray;
  }
}
