import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist-const-folding-assert')
const fixture = './tests/const_object_member_folding_test.ts'

const expectedHandlerText = `}).on('whenEntityIsCreated', (_evt, f) => {
    const gsts = globalThis.gsts;
    const selectedRoute: bigint = DefaultRoute;
    const selectedLabel: string = ReadyLabel;
    const RepeatedBonus = WorkflowCodes.Metrics.Bonus;
    const MutableBonus = gsts.f.initLocalVariable("int");
    gsts.f.setLocalVariable(MutableBonus.localVariable, WorkflowCodes.Metrics.Bonus);
    const ComputedRoute = gsts.f.initLocalVariable("int");
    gsts.f.setLocalVariable(ComputedRoute.localVariable, ComputedCodes.Route.Start);
    gsts.f.multipleBranches(selectedRoute, {
        "10": () => {
            f.printString(str(WorkflowCodes.Metrics.Bonus));
        },
        "11": () => {
            f.printString('stop');
        },
        default: () => {
            f.printString('unknown route');
        }
    });
    gsts.f.multipleBranches(selectedLabel, {
        "ready": () => {
            f.printString(WorkflowCodes.Labels.Ready);
        },
        default: () => {
            f.printString('unknown label');
        }
    });
    f.printString(str(RepeatedBonus));
    f.printString(str(RepeatedBonus));
    gsts.f.setLocalVariable(MutableBonus.localVariable, gsts.f.addition(MutableBonus.value, 2n));
    f.printString(str(MutableBonus.value));
    gsts.f.doubleBranch(gsts.f.greaterThan(selectedRoute, 0n), () => {
        AliasWorkflowCodes = OtherWorkflowCodes;
    }, () => {
    });
    f.printString(str(AliasWorkflowCodes.Route.Start));
    f.printString(str(RuntimeCodes.Route.Start));
    f.printString(str(ComputedCodes.Route.Start));
    f.printString(str(ComputedRoute.value));
    f.printString(str(ComputedRoute.value));
});
{
    const ShadowedCodes = {
        Route: {
            Start: 31n
        }
    } as const;
    const ShadowedRoute = ShadowedCodes.Route.Start;
    g.server({
        id: 1073741879
    }).on('whenEntityIsCreated', (_evt, f) => {
        const gsts = globalThis.gsts;
        f.printString(str(ShadowedRoute));
    });
}
g.server({
    id: 1073741880
}).on('whenEntityIsCreated', (_evt, f) => {
    const gsts = globalThis.gsts;
    f.printString(str(ShadowedCodes.Route.Start));
});`

function normalizeGeneratedText(text: string) {
  return text.replace(/\r\n/g, '\n').trim()
}

function assertSameGeneratedHandler(actual: string) {
  const actualNormalized = normalizeGeneratedText(actual)
  const expectedNormalized = normalizeGeneratedText(expectedHandlerText)
  if (actualNormalized !== expectedNormalized) {
    throw new Error(
      `Generated handler did not match expected output.\n\nExpected:\n${expectedNormalized}\n\nActual:\n${actualNormalized}`
    )
  }
}

function assertContains(text: string, expected: string) {
  if (!text.includes(expected)) {
    throw new Error(`Expected generated output to contain:\n${expected}`)
  }
}

function assertNotContains(text: string, unexpected: string) {
  if (text.includes(unexpected)) {
    throw new Error(`Expected generated output not to contain:\n${unexpected}`)
  }
}

try {
  fs.rmSync(outDir, { recursive: true, force: true })

  const result = await compileTsToGs({
    cfgDir: repoRoot,
    cfg: {
      compileRoot: '.',
      entries: [fixture],
      outDir
    }
  })

  const outFile = result.outFiles.find((file) =>
    file.endsWith('const_object_member_folding_test.gs.ts')
  )
  if (!outFile) throw new Error('Expected fixture GS output file to be emitted')

  const text = fs.readFileSync(outFile, 'utf8')
  const handlerStart = text.indexOf("}).on('whenEntityIsCreated'")
  if (handlerStart < 0) throw new Error('Expected generated server handler to be present')
  const handlerText = text.slice(handlerStart)

  assertSameGeneratedHandler(handlerText)
  assertNotContains(handlerText, 'RepeatedBonus.value')
  assertContains(handlerText, 'const MutableBonus = gsts.f.initLocalVariable("int");')
  assertContains(
    handlerText,
    'gsts.f.setLocalVariable(MutableBonus.localVariable, WorkflowCodes.Metrics.Bonus);'
  )
  assertContains(
    handlerText,
    'gsts.f.setLocalVariable(MutableBonus.localVariable, gsts.f.addition(MutableBonus.value, 2n));'
  )
  assertContains(handlerText, 'const ComputedRoute = gsts.f.initLocalVariable("int");')
  assertContains(
    handlerText,
    'gsts.f.setLocalVariable(ComputedRoute.localVariable, ComputedCodes.Route.Start);'
  )
  assertContains(handlerText, 'f.printString(str(ComputedRoute.value));')

  console.log(`[ok] const object member folding output verified: ${outFile}`)
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
