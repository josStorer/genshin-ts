import fs from 'node:fs'

// 只依赖 node:fs，脚手架打包地图路径逻辑时不会带进编译器依赖。

export function existsFile(p: string) {
  try {
    return fs.statSync(p).isFile()
  } catch {
    return false
  }
}

export function existsDir(p: string) {
  try {
    return fs.statSync(p).isDirectory()
  } catch {
    return false
  }
}
