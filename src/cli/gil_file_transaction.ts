import fs from 'node:fs'
import path from 'node:path'

export type GilFileVersion = {
  size: number
  mtimeMs: number
}

export function getGilFileVersion(filePath: string): GilFileVersion {
  const stat = fs.statSync(filePath)
  return { size: stat.size, mtimeMs: stat.mtimeMs }
}

export function assertGilFileUnchanged(
  filePath: string,
  expected: GilFileVersion,
  message: string
): GilFileVersion {
  const current = getGilFileVersion(filePath)
  if (current.size !== expected.size || current.mtimeMs !== expected.mtimeMs) {
    throw new Error(message)
  }
  return current
}

export function writeFileAtomic(filePath: string, bytes: Uint8Array) {
  const tempPath = path.join(
    path.dirname(filePath),
    `.${path.basename(filePath)}.${process.pid}.${Date.now()}.tmp`
  )
  try {
    fs.writeFileSync(tempPath, bytes)
    fs.renameSync(tempPath, filePath)
  } catch (error) {
    try {
      fs.unlinkSync(tempPath)
    } catch {
      // Preserve the original write error when cleanup is unnecessary or also fails.
    }
    throw error
  }
}
