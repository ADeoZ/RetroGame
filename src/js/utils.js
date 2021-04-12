export function calcTileType(index, boardSize) {
  if (index % 8 === 0) {
    if (index < boardSize) { // first column -> first line
      return 'top-left';
    }
    if (index >= boardSize ** 2 - boardSize) { // first column -> last line
      return 'bottom-left';
    }
    return 'left';
  }

  if (index % 8 === 7) {
    if (index < boardSize) { // last column -> first line
      return 'top-right';
    }
    if (index >= boardSize ** 2 - boardSize) { // last column -> last line
      return 'bottom-right';
    }
    return 'right';
  }

  if (index < boardSize) { // center -> first line
    return 'top';
  }
  if (index >= boardSize ** 2 - boardSize) { // center -> last line
    return 'bottom';
  }
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
