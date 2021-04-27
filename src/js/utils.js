export function calcTileType(index, boardSize) {
  if (index % 8 === 0) {
    // first column -> first line
    if (index < boardSize) {
      return 'top-left';
    }
    // first column -> last line
    if (index >= boardSize ** 2 - boardSize) {
      return 'bottom-left';
    }
    // else first column
    return 'left';
  }

  if (index % 8 === 7) {
    // last column -> first line
    if (index < boardSize) {
      return 'top-right';
    }
    // last column -> last line
    if (index >= boardSize ** 2 - boardSize) {
      return 'bottom-right';
    }
    // else last column
    return 'right';
  }

  // center of first line
  if (index < boardSize) {
    return 'top';
  }
  // center of last line
  if (index >= boardSize ** 2 - boardSize) {
    return 'bottom';
  }
  // all the rest
  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
