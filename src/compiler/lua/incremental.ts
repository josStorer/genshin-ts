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
}
/** Lua 专用影响分析；包含类型导入和原生模块声明，不改变节点图的依赖规则。 */
export function planLuaModules(
  sources: readonly ts.SourceFile[],
  resolve: (name: string, from: string) => ts.ResolvedModuleFull | undefined,
  previous?: LuaDependencyState
) {
  const current: LuaDependencyState = {
    sources: new Map(),
    imports: new Map(),
    dependencies: new Map()
  }
  const changed = new Set<string>()
  let full = !previous
  const affectsGlobals = (source: ts.SourceFile) =>
    source.isDeclarationFile ||
    !ts.isExternalModule(source) ||
    source.statements.some(
      (statement) =>
        ts.isModuleDeclaration(statement) &&
        (ts.isStringLiteral(statement.name) ||
          !!(statement.flags & ts.NodeFlags.GlobalAugmentation))
    )
  for (const source of sources) {
    const key = luaFileKey(source.fileName)
    current.sources.set(key, source)
    if (source !== previous?.sources.get(key)) {
      changed.add(key)
      if (
        affectsGlobals(source) ||
        (previous?.sources.has(key) && affectsGlobals(previous.sources.get(key)!))
      )
        full = true
    }
    const specs =
      previous?.sources.get(key) === source
        ? previous.imports.get(key)!
        : ts.preProcessFile(source.text, true, true).importedFiles.map((file) => file.fileName)
    current.imports.set(key, specs)
    const dependencies = new Set<string>()
    for (const spec of specs) {
      const target = resolve(spec, source.fileName)?.resolvedFileName
      if (target) dependencies.add(luaFileKey(target))
    }
    current.dependencies.set(key, dependencies)
    const old = previous?.dependencies.get(key)
    if (!old || old.size !== dependencies.size || [...dependencies].some((file) => !old.has(file)))
      changed.add(key)
  }
  for (const [key, source] of previous?.sources ?? []) {
    if (!current.sources.has(key)) {
      changed.add(key)
      if (affectsGlobals(source)) full = true
    }
  }
  const reverse = new Map<string, Set<string>>()
  // 旧边处理删除和重命名，新边处理新增及解析目标变化。
  for (const dependencies of [previous?.dependencies, current.dependencies]) {
    for (const [file, imports] of dependencies ?? []) {
      for (const imported of imports) {
        let users = reverse.get(imported)
        if (!users) reverse.set(imported, (users = new Set()))
        users.add(file)
      }
    }
  }
  return {
    state: current,
    affected: full ? new Set(current.sources.keys()) : collectDependents(reverse, changed)
  }
}
