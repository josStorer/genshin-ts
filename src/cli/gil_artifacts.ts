import fs from 'node:fs'
import { performance } from 'node:perf_hooks'

import type { ParsedGilPayload } from '../injector/types.js'
import {
  checkExistingGeneratedFile,
  parseGilPayloadFields,
  tryFormatWithPrettier
} from './gil_extract_utils.js'
import {
  extractCustomResourcesFromParsedGil,
  RESOURCES_HEADER,
  type ExtractCustomResourcesOutcome
} from './gil_resources.js'
import {
  extractSignalsFromParsedGil,
  SIGNALS_HEADER,
  type ExtractSignalsOutcome
} from './gil_signals.js'

export type GilArtifactsProfile = {
  reusedParsed: boolean
  inputBytes: number
  fieldCount: number
  checksMs: number
  readGilMs: number
  parseGilMs: number
  resourcesMs: number
  signalsMs: number
  formatMs: number
  formatAttempts: number
  formatRuns: number
  formatRequestedFiles: number
  formattedFiles: number
  formatError?: string
  totalMs: number
}

export type ExtractGilArtifactsResult = {
  resources?: ExtractCustomResourcesOutcome
  signals?: ExtractSignalsOutcome
  parsed?: ParsedGilPayload
  profile: GilArtifactsProfile
}

function failed(outPath: string, error: unknown) {
  return {
    status: 'failed' as const,
    outPath,
    error: error instanceof Error ? error.message : String(error)
  }
}

export function extractGilArtifacts(params: {
  gilPath: string
  parsed?: ParsedGilPayload
  resources?: { outPath: string; lang?: string }
  signals?: { outPath: string }
}): ExtractGilArtifactsResult {
  const totalStart = performance.now()
  const profile: GilArtifactsProfile = {
    reusedParsed: !!params.parsed,
    inputBytes: params.parsed ? params.parsed.payload.length + 24 : 0,
    fieldCount: params.parsed?.fields.length ?? 0,
    checksMs: 0,
    readGilMs: 0,
    parseGilMs: 0,
    resourcesMs: 0,
    signalsMs: 0,
    formatMs: 0,
    formatAttempts: 0,
    formatRuns: 0,
    formatRequestedFiles: 0,
    formattedFiles: 0,
    totalMs: 0
  }

  let resources: ExtractCustomResourcesOutcome | undefined
  let signals: ExtractSignalsOutcome | undefined
  let extractResources = false
  let extractSignals = false
  const formatPaths = new Set<string>()

  const checksStart = performance.now()
  if (params.resources) {
    const existing = checkExistingGeneratedFile(params.resources.outPath, RESOURCES_HEADER)
    if (existing) resources = existing
    else extractResources = true
  }
  if (params.signals) {
    const existing = checkExistingGeneratedFile(params.signals.outPath, SIGNALS_HEADER)
    if (existing) signals = existing
    else extractSignals = true
  }
  profile.checksMs = performance.now() - checksStart

  if (!extractResources && !extractSignals) {
    profile.totalMs = performance.now() - totalStart
    return { resources, signals, parsed: params.parsed, profile }
  }

  let parsed = params.parsed
  if (!parsed) {
    try {
      const readStart = performance.now()
      const bytes = fs.readFileSync(params.gilPath)
      profile.readGilMs = performance.now() - readStart
      profile.inputBytes = bytes.length

      const parseStart = performance.now()
      parsed = parseGilPayloadFields(bytes)
      profile.parseGilMs = performance.now() - parseStart
      profile.fieldCount = parsed.fields.length
    } catch (error) {
      if (extractResources && params.resources) resources = failed(params.resources.outPath, error)
      if (extractSignals && params.signals) signals = failed(params.signals.outPath, error)
      profile.totalMs = performance.now() - totalStart
      return { resources, signals, profile }
    }
  }

  if (extractResources && params.resources) {
    const start = performance.now()
    resources = extractCustomResourcesFromParsedGil({
      parsed,
      outPath: params.resources.outPath,
      lang: params.resources.lang,
      format: false
    })
    profile.resourcesMs = performance.now() - start
    if (resources.status === 'ok') formatPaths.add(resources.outPath)
  }

  if (extractSignals && params.signals) {
    const start = performance.now()
    signals = extractSignalsFromParsedGil({
      parsed,
      outPath: params.signals.outPath,
      format: false
    })
    profile.signalsMs = performance.now() - start
    if (signals.status === 'ok') formatPaths.add(signals.outPath)
  }

  if (formatPaths.size > 0) {
    const start = performance.now()
    profile.formatRequestedFiles = formatPaths.size
    const formatted = tryFormatWithPrettier([...formatPaths])
    if (formatted.attempted) profile.formatAttempts = 1
    if (formatted.succeeded) {
      profile.formatRuns = 1
      profile.formattedFiles = formatPaths.size
    } else if (formatted.error) {
      profile.formatError = formatted.error
    }
    profile.formatMs = performance.now() - start
  }

  profile.totalMs = performance.now() - totalStart
  return { resources, signals, parsed, profile }
}
