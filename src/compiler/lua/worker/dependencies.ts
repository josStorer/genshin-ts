/** 从改动文件出发，沿反向依赖找出自身和所有使用者。 */
export function collectDependents(
  reverseByFile: ReadonlyMap<string, ReadonlySet<string>>,
  files: Iterable<string>
): Set<string> {
  const result = new Set<string>()
  const queue = [...files]
  for (let index = 0; index < queue.length; index++) {
    const file = queue[index]
    if (result.has(file)) continue
    result.add(file)
    for (const dependent of reverseByFile.get(file) ?? []) queue.push(dependent)
  }
  return result
}
