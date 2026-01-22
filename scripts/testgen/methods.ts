import fs from 'node:fs'

import ts from 'typescript'

export type MethodParam = {
  name: string
  typeText: string
  optional: boolean
  rest: boolean
}

export type MethodInfo = {
  name: string
  params: MethodParam[]
  typeParams: { name: string; constraintText?: string }[]
  returnText: string
  nodeType?: string
}

function readText(p: string): string {
  return fs.readFileSync(p, 'utf8')
}

function createSourceFile(fileName: string, text: string): ts.SourceFile {
  return ts.createSourceFile(fileName, text, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)
}

export function extractNodeTypeFromMethodBody(body: ts.Block): string | undefined {
  let found: string | undefined
  const visit = (node: ts.Node) => {
    if (found) return
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'nodeType' &&
      ts.isStringLiteralLike(node.initializer)
    ) {
      found = node.initializer.text
      return
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(body, visit)
  return found
}

function isPublicMethod(m: ts.MethodDeclaration): boolean {
  return !m.modifiers?.some((mod) =>
    [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(mod.kind)
  )
}

export function extractServerFMethods(nodesTsPath: string): MethodInfo[] {
  const text = readText(nodesTsPath)
  const sf = createSourceFile(nodesTsPath, text)

  const methods: MethodInfo[] = []

  const visit = (node: ts.Node) => {
    if (ts.isClassDeclaration(node) && node.name?.text === 'ServerExecutionFlowFunctions') {
      node.members.forEach((m) => {
        if (!ts.isMethodDeclaration(m)) return
        // 只取实现（有 body）且公开的方法
        if (!m.body || !isPublicMethod(m)) return
        if (!m.name || !ts.isIdentifier(m.name)) return
        const name = m.name.text
        const params = m.parameters.map((p) => {
          const pname = ts.isIdentifier(p.name) ? p.name.text : p.name.getText(sf)
          const typeText = p.type ? p.type.getText(sf) : 'any'
          return {
            name: pname,
            typeText,
            optional: !!p.questionToken || !!p.initializer,
            rest: !!p.dotDotDotToken
          }
        })
        const typeParams = (m.typeParameters ?? []).map((tp) => ({
          name: tp.name.text,
          constraintText: tp.constraint?.getText(sf)
        }))
        const returnText = m.type ? m.type.getText(sf) : 'any'
        const nodeType = extractNodeTypeFromMethodBody(m.body)
        methods.push({ name, params, typeParams, returnText, nodeType })
      })
      return
    }
    ts.forEachChild(node, visit)
  }
  ts.forEachChild(sf, visit)

  return methods
}
