/**
 * Project-specific DSL globals for ESLint.
 *
 * 本项目特有的 DSL 全局变量清单（供 ESLint 使用）
 */
export const gstsDslGlobals = {
  gsts: 'readonly',

  // runtime/server_globals
  raw: 'readonly',

  bool: 'readonly',
  int: 'readonly',
  idx: 'readonly',
  float: 'readonly',
  str: 'readonly',
  vec3: 'readonly',
  guid: 'readonly',
  prefabId: 'readonly',
  configId: 'readonly',
  faction: 'readonly',
  entity: 'readonly',

  dict: 'readonly',
  list: 'readonly',

  print: 'readonly',
  send: 'readonly',
  player: 'readonly',
  stage: 'readonly',
  level: 'readonly',
  self: 'readonly',

  setTimeout: 'readonly',
  setInterval: 'readonly',
  clearTimeout: 'readonly',
  clearInterval: 'readonly',

  Mathf: 'readonly',
  Random: 'readonly',
  Vector3: 'readonly',
  GameObject: 'readonly'
}
