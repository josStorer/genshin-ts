import type ts from 'typescript'

/** 调用方明确传入类型环境和项目范围；诊断不会从别的编译任务借用项目。 */
export interface LuaDiagnosticContext {
  program: ts.Program
  project: {
    root: string
    /** 构建传入已发现的候选；省略时只扫描明确的 root。 */
    files?: readonly string[]
  }
}
