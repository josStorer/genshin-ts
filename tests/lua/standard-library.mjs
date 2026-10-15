import assert from 'node:assert/strict'

import {
  luaStandardLibrary,
  unavailableLuaGlobals
} from '../../src/compiler/lua/standard-library.ts'
import { buildFixture, execute, successful } from './support.mjs'

const checks = {
  Math: {
    E: 'Math.E > 2.7 && Math.E < 2.8',
    LN10: 'Math.LN10 > 2.3 && Math.LN10 < 2.4',
    LN2: 'Math.LN2 > 0.69 && Math.LN2 < 0.70',
    LOG10E: 'Math.LOG10E > 0.43 && Math.LOG10E < 0.44',
    LOG2E: 'Math.LOG2E > 1.44 && Math.LOG2E < 1.45',
    PI: 'Math.PI > 3.14 && Math.PI < 3.15',
    SQRT1_2: 'Math.SQRT1_2 > 0.70 && Math.SQRT1_2 < 0.71',
    SQRT2: 'Math.SQRT2 > 1.41 && Math.SQRT2 < 1.42',
    abs: 'Math.abs(-2) === 2',
    acos: 'Math.acos(1) === 0',
    asin: 'Math.asin(0) === 0',
    atan: 'Math.atan(0) === 0',
    atan2: 'Math.atan2(0,1) === 0',
    ceil: 'Math.ceil(1.1) === 2',
    cos: 'Math.cos(0) === 1',
    exp: 'Math.exp(0) === 1',
    floor: 'Math.floor(1.9) === 1',
    log: 'Math.log(1) === 0',
    log10: 'Math.log10(100) === 2',
    log2: 'Math.log2(8) === 3',
    log1p: 'Math.log1p(0) === 0',
    max: 'Math.max(1,3) === 3',
    min: 'Math.min(1,3) === 1',
    pow: 'Math.pow(2,3) === 8',
    random: '(()=>{const n=Math.random();return n>=0 && n<1})()',
    round: 'Math.round(1.6) === 2',
    sign: 'Math.sign(-3) === -1',
    sin: 'Math.sin(0) === 0',
    sqrt: 'Math.sqrt(9) === 3',
    tan: 'Math.tan(0) === 0',
    trunc: 'Math.trunc(-1.9) === -1'
  },
  NumberConstructor: {
    MAX_SAFE_INTEGER: 'Number.MAX_SAFE_INTEGER === 9007199254740991',
    MIN_SAFE_INTEGER: 'Number.MIN_SAFE_INTEGER === -9007199254740991',
    MAX_VALUE: 'Number.MAX_VALUE > 1e308',
    MIN_VALUE: 'Number.MIN_VALUE > 0 && Number.MIN_VALUE < 1e-300',
    EPSILON: 'Number.EPSILON > 0 && Number.EPSILON < 1e-15',
    POSITIVE_INFINITY: 'Number.POSITIVE_INFINITY > 1e308',
    NEGATIVE_INFINITY: 'Number.NEGATIVE_INFINITY < -1e308',
    NaN: 'Number.NaN !== Number.NaN',
    isInteger: 'Number.isInteger(2) && !Number.isInteger(2.5)',
    isNaN: 'Number.isNaN(0/0) && !Number.isNaN(2)',
    isFinite: 'Number.isFinite(2) && !Number.isFinite(1/0)',
    parseInt: 'Number.parseInt("ff",16) === 255',
    parseFloat: 'Number.parseFloat("1.5x") === 1.5'
  },
  Number: { toString: '(31).toString(16) === "1f"', toFixed: '(1.25).toFixed(1) === "1.3"' },
  StringConstructor: { fromCharCode: 'String.fromCharCode(65,66) === "AB"' },
  String: {
    length: '"abc".length === 3',
    replace: '"abab".replace("a","c") === "cbab"',
    replaceAll: '"abab".replaceAll("a","c") === "cbcb"',
    concat: '"a".concat("b","c") === "abc"',
    indexOf: '"abc".indexOf("b") === 1',
    substr: '"abcd".substr(1,2) === "bc"',
    substring: '"abcd".substring(1,3) === "bc"',
    slice: '"abcd".slice(1,-1) === "bc"',
    toLowerCase: '"AB".toLowerCase() === "ab"',
    toUpperCase: '"ab".toUpperCase() === "AB"',
    trim: '" a ".trim() === "a"',
    trimEnd: '" a ".trimEnd() === " a"',
    trimRight: '" a ".trimRight() === " a"',
    trimStart: '" a ".trimStart() === "a "',
    trimLeft: '" a ".trimLeft() === "a "',
    split: '"a,b".split(",")[1] === "b"',
    charAt: '"abc".charAt(1) === "b"',
    charCodeAt: '"ABC".charCodeAt(1) === 66',
    startsWith: '"abc".startsWith("ab")',
    endsWith: '"abc".endsWith("bc")',
    includes: '"abc".includes("b")',
    repeat: '"ab".repeat(2) === "abab"',
    padStart: '"a".padStart(3,"0") === "00a"',
    padEnd: '"a".padEnd(3,"0") === "a00"',
    toString: '"ab".toString() === "ab"'
  },
  ArrayConstructor: {
    from: 'Array.from(new Set([1,2])).join(",") === "1,2"',
    isArray: 'Array.isArray([1]) && !Array.isArray(2)',
    of: 'Array.of(1,2).join(",") === "1,2"'
  },
  Array: {
    length: '[1,2].length === 2',
    at: '[1,2].at(-1) === 2',
    concat: '[1].concat([2])[1] === 2',
    entries: 'Array.from([3,4].entries())[1][0] === 1',
    fill: '[0,0].fill(2)[1] === 2',
    push: '(()=>{const a=[1];return a.push(2)===2 && a[1]===2})()',
    reverse: '[1,2].reverse()[0] === 2',
    shift: '(()=>{const a=[1,2];return a.shift()===1 && a[0]===2})()',
    unshift: '(()=>{const a=[2];return a.unshift(1)===2 && a[0]===1})()',
    sort: '[3,1,2].sort((a,b)=>a-b).join(",") === "1,2,3"',
    pop: '[1,2].pop() === 2',
    forEach: '(()=>{let n=0;[1,2].forEach(v=>{n+=v});return n===3})()',
    find: '[1,2].find(v=>v>1) === 2',
    findIndex: '[1,2].findIndex(v=>v>1) === 1',
    includes: '[1,2].includes(2)',
    indexOf: '[1,2].indexOf(2) === 1',
    map: '[1,2].map(v=>v*2)[1] === 4',
    filter: '[1,2].filter(v=>v>1)[0] === 2',
    reduce: '[1,2].reduce((a,b)=>a+b,0) === 3',
    reduceRight: '[1,2].reduceRight((a,b)=>a-b,0) === -3',
    some: '[1,2].some(v=>v===2)',
    every: '[1,2].every(v=>v>0)',
    slice: '[1,2,3].slice(1,2)[0] === 2',
    splice: '(()=>{const a=[1,2,3];return a.splice(1,1)[0]===2 && a.join(",")==="1,3"})()',
    join: '[1,2].join("-") === "1-2"',
    flat: '[[1],[2]].flat()[1] === 2',
    flatMap: '[1,2].flatMap(v=>[v,v])[3] === 2'
  },
  ObjectConstructor: {
    assign: 'Object.assign({a:1},{b:2}).b === 2',
    defineProperty: '(()=>{const o={x:1};Object.defineProperty(o,"x",{value:2});return o.x===2})()',
    entries: 'Object.entries({a:1})[0][0] === "a"',
    fromEntries: 'Object.fromEntries([["a",1]]).a === 1',
    keys: 'Object.keys({a:1})[0] === "a"',
    values: 'Object.values({a:1})[0] === 1'
  },
  Object: {
    hasOwnProperty: '({a:1}).hasOwnProperty("a")'
  },
  MapConstructor: {},
  Map: {
    size: 'new Map([["a",1]]).size === 1',
    clear: '(()=>{const m=new Map([["a",1]]);m.clear();return m.size===0})()',
    delete: '(()=>{const m=new Map([["a",1]]);return m.delete("a") && m.size===0})()',
    entries: 'Array.from(new Map([["a",1]]).entries())[0][1] === 1',
    forEach: '(()=>{let n=0;new Map([["a",1]]).forEach(v=>{n+=v});return n===1})()',
    get: 'new Map([["a",1]]).get("a") === 1',
    has: 'new Map([["a",1]]).has("a")',
    keys: 'Array.from(new Map([["a",1]]).keys())[0] === "a"',
    set: 'new Map<string,number>().set("a",1).get("a") === 1',
    values: 'Array.from(new Map([["a",1]]).values())[0] === 1'
  },
  SetConstructor: {},
  Set: {
    size: 'new Set([1,1]).size === 1',
    add: 'new Set<number>().add(1).has(1)',
    clear: '(()=>{const s=new Set([1]);s.clear();return s.size===0})()',
    delete: '(()=>{const s=new Set([1]);return s.delete(1) && s.size===0})()',
    entries: 'Array.from(new Set([1]).entries())[0][1] === 1',
    forEach: '(()=>{let n=0;new Set([1,2]).forEach(v=>{n+=v});return n===3})()',
    has: 'new Set([1]).has(1)',
    keys: 'Array.from(new Set([1]).keys())[0] === 1',
    values: 'Array.from(new Set([1]).values())[0] === 1'
  }
}
const assertions = []
for (const [owner, members] of Object.entries(luaStandardLibrary)) {
  assert.deepEqual(
    Object.keys(checks[owner]).sort(),
    [...members].sort(),
    `${owner}: every supported member needs an execution test`
  )
  for (const [name, test] of Object.entries(checks[owner]))
    assertions.push(`lua.assert(${test}, '${owner}.${name}');`)
}
const entry = (body) =>
  `import{g}from'genshin-ts/runtime/core';export default g.clientControlScript(lua=>{return{onStart(){${body}}}})`
const supported = successful(buildFixture({ 'main.ts': entry(assertions.join('\n')) }))
execute(supported.files, "require('main');OnStart()")
const boolean = successful(
  buildFixture({
    'main.ts': entry(`
  const convert=Boolean; let evaluated=0;
  lua.assert(Boolean()===false && convert(0)===false && Boolean('')===false && Boolean(0/0)===false && Boolean(undefined)===false && Boolean(false)===false);
  lua.assert(Boolean(-1) && Boolean('0') && Boolean({}) && Boolean([]) && Boolean(()=>0));
  lua.assert(Boolean(++evaluated) && evaluated===1);
  lua.assert([0,1,2].filter(Boolean).join(',')==='1,2');
  const conversions=[0,1].map(convert);lua.assert(!conversions[0] && conversions[1]);
`)
  })
)
execute(boolean.files, "require('main');OnStart()")
for (const body of [
  'new Boolean(0)',
  'const B=Boolean;new B(0)',
  'Math.cosh(1)',
  'Object.freeze({})',
  '({}).toString()',
  'Object.getOwnPropertyDescriptor({a:1},"a")',
  'Object.getOwnPropertyDescriptors({a:1})',
  'String.fromCodePoint(65)',
  'Number.isSafeInteger(1)',
  '"a".localeCompare("b")',
  '[1].copyWithin(0,1)',
  'const f=Math.abs;f(-1)',
  'const {abs}=Math;abs(-1)'
]) {
  const result = buildFixture({ 'main.ts': entry(body) }, false)
  assert(
    result.diagnostics.some((d) => d.source === 'lua-standard-library'),
    body
  )
  assert.equal(result.files.size, 0, body)
}
for (const name of unavailableLuaGlobals) {
  const result = buildFixture({ 'main.ts': entry(`const value=${name};lua.print(value)`) }, false)
  assert(
    result.diagnostics.some((d) => d.source === 'lua-unavailable-global'),
    name
  )
  assert.equal(result.files.size, 0, name)
}
const local = successful(
  buildFixture({
    'main.ts': entry(
      `function setTimeout(value:number){return value+1}const clearTimeout=(n:number)=>n;const JSON={value:2};lua.assert(clearTimeout(setTimeout(JSON.value))===3)`
    )
  })
)
execute(local.files, "require('main');OnStart()")
console.log(
  `Lua standard library: ${assertions.length} members executed; Boolean, unavailable members/globals and local shadows: PASS`
)
