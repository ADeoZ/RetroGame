import Character from './Character';
import Team from './Team';

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const rand = Math.floor(Math.random() * allowedTypes.length); // 0 - allowedTypes.length
  const level = Math.floor(1 + Math.random() * maxLevel); // 1 - maxLevel
  yield new Character(level, allowedTypes[rand]);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = new Team();
  for (let i = 0; i <= characterCount; i += 1) {
    team.add(characterGenerator(allowedTypes, maxLevel));
  }
  return team;
}
