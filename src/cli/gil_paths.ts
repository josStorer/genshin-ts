import fs from 'node:fs'
import path from 'node:path'

import type { GstsGameRegion, GstsInjectConfig } from '../compiler/gsts_config.js'
import { existsDir, existsFile } from '../shared/fs_exists.js'

function listNumericDirs(parent: string): number[] {
  if (!existsDir(parent)) return []
  return fs
    .readdirSync(parent, { withFileTypes: true })
    .filter((d) => d.isDirectory() && /^\d+$/.test(d.name))
    .map((d) => Number(d.name))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)
}

export type ResolvedGilTarget = {
  region: GstsGameRegion
  beyondLocalRoot: string
  playerId: number
  saveLevelDir: string
  mapId: number
  gilPath: string
}

export type ResolvedGilFolder = {
  region: GstsGameRegion
  beyondLocalRoot: string
  playerId: number
  saveLevelDir: string
}

function getLocalLowDir(): string {
  const localAppData = process.env.LOCALAPPDATA
  if (!localAppData) throw new Error('[error] LOCALAPPDATA not found (Windows required)')
  const appDataDir = path.dirname(localAppData)
  return path.join(appDataDir, 'LocalLow')
}

function getBeyondLocalRoot(region: GstsGameRegion): string {
  const localLow = getLocalLowDir()
  if (region === 'China') return path.join(localLow, 'miHoYo', '原神', 'BeyondLocal')
  return path.join(localLow, 'miHoYo', 'Genshin Impact', 'BeyondLocal')
}

export function detectGameRegion(): { region: GstsGameRegion; root: string } | null {
  const china = getBeyondLocalRoot('China')
  const global = getBeyondLocalRoot('Global')
  const hasChina = existsDir(china)
  const hasGlobal = existsDir(global)
  if (hasChina && !hasGlobal) return { region: 'China', root: china }
  if (!hasChina && hasGlobal) return { region: 'Global', root: global }
  return null
}

function resolveBase(cfg: GstsInjectConfig): ResolvedGilFolder {
  const auto = detectGameRegion()
  let region: GstsGameRegion | undefined = cfg.gameRegion
  if (!region) {
    if (!auto) {
      throw new Error(
        '[error] gameRegion is required (both China/Global folders exist or neither found)'
      )
    }
    region = auto.region
  }

  const beyondLocalRoot = getBeyondLocalRoot(region)
  if (!existsDir(beyondLocalRoot)) {
    throw new Error(`[error] BeyondLocal folder not found: ${beyondLocalRoot}`)
  }

  const numeric = listNumericDirs(beyondLocalRoot)
  const playerId =
    typeof cfg.playerId === 'number' ? cfg.playerId : numeric.length === 1 ? numeric[0] : undefined
  if (typeof playerId !== 'number' || !Number.isFinite(playerId)) {
    throw new Error('[error] playerId is required (multiple accounts found)')
  }

  const saveLevelDir = path.join(beyondLocalRoot, String(playerId), 'Beyond_Local_Save_Level')
  if (!existsDir(saveLevelDir)) {
    throw new Error(`[error] Beyond_Local_Save_Level not found: ${saveLevelDir}`)
  }

  return { region, beyondLocalRoot, playerId, saveLevelDir }
}

export function resolveGilTarget(cfg: GstsInjectConfig): ResolvedGilTarget {
  const { region, beyondLocalRoot, playerId, saveLevelDir } = resolveBase(cfg)

  const mapId = cfg.mapId
  if (typeof mapId !== 'number' || !Number.isFinite(mapId)) {
    throw new Error('[error] mapId is required')
  }

  // Prefer the current layout when an older flat save still exists.
  const candidates = [
    path.join(saveLevelDir, String(mapId), `${mapId}.gil`),
    path.join(saveLevelDir, `${mapId}.gil`)
  ]
  const gilPath = candidates.find(existsFile)
  if (!gilPath) {
    throw new Error(`[error] target gil not found: ${candidates.join(' or ')}`)
  }

  return { region, beyondLocalRoot, playerId, saveLevelDir, mapId, gilPath }
}

export function resolveGilFolder(cfg: GstsInjectConfig): ResolvedGilFolder {
  return resolveBase(cfg)
}

export type LocalSave = {
  region: GstsGameRegion
  playerId: number
  maps: { mapId: number; gilPath: string; mtimeMs: number }[]
}

/** 本机各区服、各账号下的地图存档，地图按最近修改排在前面；找不到存档目录时返回空数组。 */
export function listLocalSaves(): LocalSave[] {
  if (!process.env.LOCALAPPDATA) return []
  const saves: LocalSave[] = []
  for (const region of ['China', 'Global'] as const) {
    const root = getBeyondLocalRoot(region)
    for (const playerId of listNumericDirs(root)) {
      const saveLevelDir = path.join(root, String(playerId), 'Beyond_Local_Save_Level')
      if (!existsDir(saveLevelDir)) continue
      const maps = listGilFiles(saveLevelDir)
        .map((gilPath) => ({
          mapId: Number(path.basename(gilPath, path.extname(gilPath))),
          gilPath,
          mtimeMs: fs.statSync(gilPath).mtimeMs
        }))
        .filter((map) => Number.isFinite(map.mapId))
        .sort((a, b) => b.mtimeMs - a.mtimeMs)
      saves.push({ region, playerId, maps })
    }
  }
  return saves
}

export function listGilFiles(saveLevelDir: string): string[] {
  const entries = fs.readdirSync(saveLevelDir, { withFileTypes: true })
  const files = new Map<string, string>()
  for (const entry of entries) {
    if (entry.isFile() && entry.name.toLowerCase().endsWith('.gil')) {
      files.set(entry.name.toLowerCase(), path.join(saveLevelDir, entry.name))
    }
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue
    const name = `${entry.name}.gil`
    const gilPath = path.join(saveLevelDir, entry.name, name)
    if (existsFile(gilPath)) files.set(name, gilPath)
  }
  return [...files.values()]
}
