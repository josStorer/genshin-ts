import type { Rule } from 'eslint'
import ts from 'typescript'

import type { LuaDiagnosticContext } from '../../compiler/lua/diagnostic_context.js'
import {
  getLuaDiagnostics,
  getSharedModuleDiagnostics,
  resolveSharedProject
} from '../../compiler/lua/diagnostics.js'
import { entryCall } from '../../compiler/lua/syntax.js'
import { getParserServices } from '../utils/parser.js'

const contexts = new WeakMap<ts.Program, LuaDiagnosticContext>()

export function luaRule(name: string): Rule.RuleModule {
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
            .types?.includes('genshin-ts/runtime/lua_globals')
          if (!isolated && !entryCall(source) && name !== 'lua-shared-module') return
          let diagnosticContext = contexts.get(services.program)
          if (!diagnosticContext) {
            diagnosticContext = {
              program: services.program,
              project: resolveSharedProject(source, services.program)
            }
            contexts.set(services.program, diagnosticContext)
          }
          const diagnostics =
            !isolated && !entryCall(source)
              ? getSharedModuleDiagnostics(source, diagnosticContext)
              : getLuaDiagnostics(source, diagnosticContext)
          for (const diagnostic of diagnostics) {
            if (diagnostic.source !== name) continue
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
