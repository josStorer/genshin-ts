import path from 'node:path'

import { program } from 'commander'

import { existsFile, loadGstsConfig } from './config_loader.js'
import { emitIrJsonForEntries } from './gs_to_ir_json_transform/index.js'
import { compileTsToGs } from './ts_to_gs_pipeline.js'

program
  .name('gsts_ts_to_gs')
  .description('Preprocess TS DSL into *.gs.ts')
  .option('-c, --config <file>', 'Config file path')
  .showHelpAfterError('(use --help to see all options)')
  .action(async () => {
    const opts = program.opts<{ config?: string }>()
    const cfgAbsPath = path.resolve(process.cwd(), opts.config ?? 'gsts.config.ts')
    if (!existsFile(cfgAbsPath)) throw new Error(`[error] config not found: ${cfgAbsPath}`)
    const cfgDir = path.dirname(cfgAbsPath)
    const cfg = await loadGstsConfig(cfgAbsPath)

    const result = await compileTsToGs({ cfgDir, cfg })
    const { outFiles, entryOutFiles } = result
    outFiles.forEach((outFile) => console.log(`[ok] ${outFile}`))
    if (entryOutFiles.length) {
      await emitIrJsonForEntries(entryOutFiles, {
        cwd: cfgDir,
        moduleFiles: result.moduleOutFiles,
        moduleRoot: result.outDir,
        runtimeOptions: {
          precompileExpression: cfg.options?.optimize?.precompileExpression ?? true,
          removeUnusedNodes: cfg.options?.optimize?.removeUnusedNodes ?? true
        }
      })
    }
  })

program.parse()
