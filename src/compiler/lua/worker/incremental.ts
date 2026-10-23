import path from 'node:path'

import ts from 'typescript'

import { collectDependents } from './dependencies.js'

export const luaFileKey = (file: string) => {
  const absolute = path.resolve(file).replace(/\\/g, '/')
  return ts.sys.useCaseSensitiveFileNames ? absolute : absolute.toLowerCase()
}
export interface LuaDependencyState {
  sources: Map<string, ts.SourceFile>
  imports: Map<string, string[]>
  dependencies: Map<string, Set<string>>
  reverse: Map<string, Set<string>>
}
/** Lua 专用影响分析；普通编辑只更新变化文件的依赖边，不改变节点图的规则。 */
export function planLuaModules(
  sources: readonly ts.SourceFile[],
  resolve: (name: string, from: string) => ts.ResolvedModuleFull | undefined,
  previous?: LuaDependencyState,
  resolveAll = true
) {
  const current: LuaDependencyState = {
    sources: new Map(sources.map((source) => [luaFileKey(source.fileName), source])),
    imports: new Map(previous?.imports),
    dependencies: new Map(previous?.dependencies),
    reverse: new Map(previous?.reverse)
  }
  const changed = new Set<string>()
  let full = !previous
  let resolvedFiles = 0
  const affectsGlobals = (source: ts.SourceFile) =>
    source.isDeclarationFile ||
    !ts.isExternalModule(source) ||
    source.statements.some(
      (statement) =>
        ts.isModuleDeclaration(statement) &&
        (ts.isStringLiteral(statement.name) ||
          !!(statement.flags & ts.NodeFlags.GlobalAugmentation))
    )
  const replaced = new Set<string>()
  for (const [key, source] of current.sources) {
    const oldSource = previous?.sources.get(key)
    if (source !== oldSource) {
      changed.add(key)
      if (affectsGlobals(source) || (oldSource && affectsGlobals(oldSource))) full = true
    }
    if (!resolveAll && source === oldSource) continue
    resolvedFiles++
    const specs =
      source === oldSource
        ? previous!.imports.get(key)!
        : ts.preProcessFile(source.text, true, true).importedFiles.map((file) => file.fileName)
    current.imports.set(key, specs)
    const dependencies = new Set<string>()
    for (const spec of specs) {
      const target = resolve(spec, source.fileName)?.resolvedFileName
      if (target) dependencies.add(luaFileKey(target))
    }
    const old = previous?.dependencies.get(key)
    if (
      !old ||
      old.size !== dependencies.size ||
      [...dependencies].some((file) => !old.has(file))
    ) {
      changed.add(key)
      replaced.add(key)
      current.dependencies.set(key, dependencies)
    }
  }
  for (const [key, source] of previous?.sources ?? []) {
    if (!current.sources.has(key)) {
      changed.add(key)
      replaced.add(key)
      current.imports.delete(key)
      current.dependencies.delete(key)
      if (affectsGlobals(source)) full = true
    }
  }
  // 先沿旧边找受影响的使用者，再替换变化边；失败时不改坏上次成功的依赖表。
  const affected = collectDependents(previous?.reverse ?? new Map(), changed)
  const edited = new Set<string>()
  for (const file of replaced) {
    const old = previous?.dependencies.get(file) ?? new Set<string>()
    const next = current.dependencies.get(file) ?? new Set<string>()
    for (const target of new Set([...old, ...next])) {
      if (old.has(target) === next.has(target)) continue
      if (!edited.has(target)) {
        current.reverse.set(target, new Set(current.reverse.get(target)))
        edited.add(target)
      }
      const users = current.reverse.get(target)!
      if (next.has(target)) users.add(file)
      else users.delete(file)
    }
  }
  for (const target of edited)
    if (!current.reverse.get(target)!.size) current.reverse.delete(target)
  for (const file of collectDependents(current.reverse, changed)) affected.add(file)
  return {
    state: current,
    resolvedFiles,
    affected: full ? new Set(current.sources.keys()) : affected
  }
}
