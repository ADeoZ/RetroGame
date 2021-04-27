/**
* Positions for every chars
* keep the position and char class
* calc possible attack and step cells for char based on it position
*/

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

  // calc possible steps based on current position and step radius
  get stepCells() {
    const boardSize = 8;
    const stepsArray = [this.position];
    const positionLine = this.position % boardSize;

    // moving around within the board, chosing only horizontals, verticals and diagonals
    for (let i = 1; i <= this.character.stepRadius; i += 1) {
      const top = this.position - boardSize * i;
      const topRight = this.position - boardSize * i + i;
      const right = this.position + 1 * i;
      const bottomRight = this.position + boardSize * i + i;
      const bottom = this.position + boardSize * i;
      const bottomLeft = this.position + boardSize * i - i;
      const left = this.position - 1 * i;
      const topLeft = this.position - boardSize * i - i;

      // comparison '>= 0' mean top left corner
      // comparison 'boardSize ** 2' mean bottom right corner
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

  // calc possible attack cells based on current position and attack radius
  get attackCells() {
    const boardSize = 8;
    const attackArray = [];

    // calc entire area around the char within board size
    const rowStart = Math.floor(this.position / boardSize) - this.character.attackRadius >= 0
      ? Math.floor(this.position / boardSize) - this.character.attackRadius : 0;
    const rowEnd = Math.floor(this.position / boardSize) + this.character.attackRadius < boardSize
      ? Math.floor(this.position / boardSize) + this.character.attackRadius : boardSize - 1;
    const lineStart = (this.position % boardSize) - this.character.attackRadius >= 0
      ? (this.position % boardSize) - this.character.attackRadius : 0;
    const lineEnd = (this.position % boardSize) + this.character.attackRadius < boardSize
      ? (this.position % boardSize) + this.character.attackRadius : boardSize - 1;

    // moving line by line
    for (let i = rowStart; i <= rowEnd; i += 1) {
      for (let j = lineStart; j <= lineEnd; j += 1) {
        attackArray.push(i * boardSize + j);
      }
    }
    return attackArray;
  }
}
