import type { Rule } from 'eslint'
import ts from 'typescript'

import { getLuaDiagnostics } from '../../compiler/lua/diagnostics.js'
import { entryCall } from '../../compiler/lua/syntax.js'
import { getParserServices } from '../utils/parser.js'

export function luaRule(warnings: boolean): Rule.RuleModule {
  return {
    meta: { type: 'problem', schema: [] },
    create(context) {
      const services = getParserServices(context)
      if (!services) return {}
      return {
        Program(node) {
          const source = services.esTreeNodeToTSNodeMap.get(node)
          if (!source || !ts.isSourceFile(source)) return
          const isolated = services.program
            .getCompilerOptions()
            .types?.includes('genshin-ts/runtime/lua-globals')
          if (!isolated && !entryCall(source)) return
          for (const diagnostic of getLuaDiagnostics(source, services.program)) {
            if ((diagnostic.category === ts.DiagnosticCategory.Warning) !== warnings) continue
            const start = source.getLineAndCharacterOfPosition(diagnostic.start ?? 0)
            const end = source.getLineAndCharacterOfPosition(
              (diagnostic.start ?? 0) + (diagnostic.length ?? 1)
            )
            context.report({
              loc: {
                start: { line: start.line + 1, column: start.character },
                end: { line: end.line + 1, column: end.character }
              },
              message: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
            })
          }
        }
      }
    }
  }
}
