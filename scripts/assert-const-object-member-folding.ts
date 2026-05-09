import fs from 'node:fs'
import path from 'node:path'

import { compileTsToGs } from '../src/compiler/ts_to_gs_pipeline.js'

const repoRoot = process.cwd()
const outDir = path.join(repoRoot, 'dist-const-folding-assert')
const fixture = './tests/const_object_member_folding_test.ts'

const expectedHandlerText = `}).on('whenEntityIsCreated', (_evt, f) => {
    const gsts = globalThis.gsts;
    const selectedRoute: bigint = 10n;
    const selectedLabel: string = "ready";
    gsts.f.multipleBranches(10n, {
        "10": () => {
            f.printString(str(300n));
        },
        "11": () => {
            f.printString('stop');
        },
        default: () => {
            f.printString('unknown route');
        }
    });
    gsts.f.multipleBranches("ready", {
        "ready": () => {
            f.printString("ready");
        },
        default: () => {
            f.printString('unknown label');
        }
    });
    f.printString(str(300n));
    f.printString(str(300n));
    f.printString(str(RuntimeCodes.Route.Start));
    f.printString(str(ComputedCodes.Route.Start));
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
        f.printString(str(31n));
    });
}
g.server({
    id: 1073741880
}).on('whenEntityIsCreated', (_evt, f) => {
    const gsts = globalThis.gsts;
    f.printString(str(30n));
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

  console.log(`[ok] const object member folding output verified: ${outFile}`)
} finally {
  fs.rmSync(outDir, { recursive: true, force: true })
}
