import { g } from 'genshin-ts/runtime/core'
import { configId, faction, guid, prefabId } from 'genshin-ts/runtime/value'
import * as E from 'genshin-ts/definitions/enum'

// AUTO-GENERATED: group_04 (literal)
// Run: npx tsx scripts/generate-node-gia-tests.ts

g.server({ id: 1073741833 }).on('whenEntityIsCreated', (_evt, f) => {
  // assemblyDictionary :: dict<configId, bool>
  f.assemblyDictionary([{ k: 1, v: 2 }, { k: 3, v: 4 }])
  // assemblyDictionary :: dict<configId, configId>
  f.assemblyDictionary([{ k: 5, v: 6 }, { k: 7, v: 8 }])
  // assemblyDictionary :: dict<configId, entity>
  f.assemblyDictionary([{ k: 9, v: 10 }, { k: 11, v: 12 }])
  // assemblyDictionary :: dict<configId, faction>
  f.assemblyDictionary([{ k: 13, v: 14 }, { k: 15, v: 16 }])
  // assemblyDictionary :: dict<configId, float>
  f.assemblyDictionary([{ k: 17, v: 18 }, { k: 19, v: 20 }])
  // assemblyDictionary :: dict<configId, guid>
  f.assemblyDictionary([{ k: 21, v: 22 }, { k: 23, v: 24 }])
  // assemblyDictionary :: dict<configId, int>
  f.assemblyDictionary([{ k: 25, v: 26 }, { k: 27, v: 28 }])
  // assemblyDictionary :: dict<configId, list<bool>>
  f.assemblyDictionary([{ k: 29, v: 30 }, { k: 31, v: 32 }])
  // assemblyDictionary :: dict<configId, list<configId>>
  f.assemblyDictionary([{ k: 33, v: 34 }, { k: 35, v: 36 }])
  // assemblyDictionary :: dict<configId, list<entity>>
  f.assemblyDictionary([{ k: 37, v: 38 }, { k: 39, v: 40 }])
  // assemblyDictionary :: dict<configId, list<faction>>
  f.assemblyDictionary([{ k: 41, v: 42 }, { k: 43, v: 44 }])
  // assemblyDictionary :: dict<configId, list<float>>
  f.assemblyDictionary([{ k: 45, v: 46 }, { k: 47, v: 48 }])
  // assemblyDictionary :: dict<configId, list<guid>>
  f.assemblyDictionary([{ k: 49, v: 50 }, { k: 51, v: 52 }])
  // assemblyDictionary :: dict<configId, list<int>>
  f.assemblyDictionary([{ k: 53, v: 54 }, { k: 55, v: 56 }])
  // assemblyDictionary :: dict<configId, list<str>>
  f.assemblyDictionary([{ k: 57, v: 58 }, { k: 59, v: 60 }])
  // assemblyDictionary :: dict<configId, list<vec3>>
  f.assemblyDictionary([{ k: 61, v: 62 }, { k: 63, v: 64 }])
  // assemblyDictionary :: dict<configId, prefabId>
  f.assemblyDictionary([{ k: 65, v: 66 }, { k: 67, v: 68 }])
  // assemblyDictionary :: dict<configId, str>
  f.assemblyDictionary([{ k: 69, v: 70 }, { k: 71, v: 72 }])
  // assemblyDictionary :: dict<configId, vec3>
  f.assemblyDictionary([{ k: 73, v: 74 }, { k: 75, v: 76 }])
  // assemblyDictionary :: dict<entity, bool>
  f.assemblyDictionary([{ k: 77, v: 78 }, { k: 79, v: 80 }])
  // assemblyDictionary :: dict<entity, configId>
  f.assemblyDictionary([{ k: 81, v: 82 }, { k: 83, v: 84 }])
  // assemblyDictionary :: dict<entity, entity>
  f.assemblyDictionary([{ k: 85, v: 86 }, { k: 87, v: 88 }])
  // assemblyDictionary :: dict<entity, faction>
  f.assemblyDictionary([{ k: 89, v: 90 }, { k: 91, v: 92 }])
  // assemblyDictionary :: dict<entity, float>
  f.assemblyDictionary([{ k: 93, v: 94 }, { k: 95, v: 96 }])
  // assemblyDictionary :: dict<entity, guid>
  f.assemblyDictionary([{ k: 97, v: 98 }, { k: 99, v: 100 }])
  // assemblyDictionary :: dict<entity, int>
  f.assemblyDictionary([{ k: 101, v: 102 }, { k: 103, v: 104 }])
  // assemblyDictionary :: dict<entity, list<bool>>
  f.assemblyDictionary([{ k: 105, v: 106 }, { k: 107, v: 108 }])
  // assemblyDictionary :: dict<entity, list<configId>>
  f.assemblyDictionary([{ k: 109, v: 110 }, { k: 111, v: 112 }])
  // assemblyDictionary :: dict<entity, list<entity>>
  f.assemblyDictionary([{ k: 113, v: 114 }, { k: 115, v: 116 }])
  // assemblyDictionary :: dict<entity, list<faction>>
  f.assemblyDictionary([{ k: 117, v: 118 }, { k: 119, v: 120 }])
  // assemblyDictionary :: dict<entity, list<float>>
  f.assemblyDictionary([{ k: 121, v: 122 }, { k: 123, v: 124 }])
  // assemblyDictionary :: dict<entity, list<guid>>
  f.assemblyDictionary([{ k: 125, v: 126 }, { k: 127, v: 128 }])
  // assemblyDictionary :: dict<entity, list<int>>
  f.assemblyDictionary([{ k: 129, v: 130 }, { k: 131, v: 132 }])
  // assemblyDictionary :: dict<entity, list<str>>
  f.assemblyDictionary([{ k: 133, v: 134 }, { k: 135, v: 136 }])
  // assemblyDictionary :: dict<entity, list<vec3>>
  f.assemblyDictionary([{ k: 137, v: 138 }, { k: 139, v: 140 }])
  // assemblyDictionary :: dict<entity, prefabId>
  f.assemblyDictionary([{ k: 141, v: 142 }, { k: 143, v: 144 }])
  // assemblyDictionary :: dict<entity, str>
  f.assemblyDictionary([{ k: 145, v: 146 }, { k: 147, v: 148 }])
  // assemblyDictionary :: dict<entity, vec3>
  f.assemblyDictionary([{ k: 149, v: 150 }, { k: 151, v: 152 }])
  // assemblyDictionary :: dict<faction, bool>
  f.assemblyDictionary([{ k: 153, v: 154 }, { k: 155, v: 156 }])
  // assemblyDictionary :: dict<faction, configId>
  f.assemblyDictionary([{ k: 157, v: 158 }, { k: 159, v: 160 }])
  // assemblyDictionary :: dict<faction, entity>
  f.assemblyDictionary([{ k: 161, v: 162 }, { k: 163, v: 164 }])
  // assemblyDictionary :: dict<faction, faction>
  f.assemblyDictionary([{ k: 165, v: 166 }, { k: 167, v: 168 }])
  // assemblyDictionary :: dict<faction, float>
  f.assemblyDictionary([{ k: 169, v: 170 }, { k: 171, v: 172 }])
  // assemblyDictionary :: dict<faction, guid>
  f.assemblyDictionary([{ k: 173, v: 174 }, { k: 175, v: 176 }])
  // assemblyDictionary :: dict<faction, int>
  f.assemblyDictionary([{ k: 177, v: 178 }, { k: 179, v: 180 }])
  // assemblyDictionary :: dict<faction, list<bool>>
  f.assemblyDictionary([{ k: 181, v: 182 }, { k: 183, v: 184 }])
  // assemblyDictionary :: dict<faction, list<configId>>
  f.assemblyDictionary([{ k: 185, v: 186 }, { k: 187, v: 188 }])
  // assemblyDictionary :: dict<faction, list<entity>>
  f.assemblyDictionary([{ k: 189, v: 190 }, { k: 191, v: 192 }])
  // assemblyDictionary :: dict<faction, list<faction>>
  f.assemblyDictionary([{ k: 193, v: 194 }, { k: 195, v: 196 }])
  // assemblyDictionary :: dict<faction, list<float>>
  f.assemblyDictionary([{ k: 197, v: 198 }, { k: 199, v: 200 }])
  // assemblyDictionary :: dict<faction, list<guid>>
  f.assemblyDictionary([{ k: 201, v: 202 }, { k: 203, v: 204 }])
  // assemblyDictionary :: dict<faction, list<int>>
  f.assemblyDictionary([{ k: 205, v: 206 }, { k: 207, v: 208 }])
  // assemblyDictionary :: dict<faction, list<str>>
  f.assemblyDictionary([{ k: 209, v: 210 }, { k: 211, v: 212 }])
  // assemblyDictionary :: dict<faction, list<vec3>>
  f.assemblyDictionary([{ k: 213, v: 214 }, { k: 215, v: 216 }])
  // assemblyDictionary :: dict<faction, prefabId>
  f.assemblyDictionary([{ k: 217, v: 218 }, { k: 219, v: 220 }])
  // assemblyDictionary :: dict<faction, str>
  f.assemblyDictionary([{ k: 221, v: 222 }, { k: 223, v: 224 }])
  // assemblyDictionary :: dict<faction, vec3>
  f.assemblyDictionary([{ k: 225, v: 226 }, { k: 227, v: 228 }])
  // assemblyDictionary :: dict<guid, bool>
  f.assemblyDictionary([{ k: 229, v: 230 }, { k: 231, v: 232 }])
  // assemblyDictionary :: dict<guid, configId>
  f.assemblyDictionary([{ k: 233, v: 234 }, { k: 235, v: 236 }])
  // assemblyDictionary :: dict<guid, entity>
  f.assemblyDictionary([{ k: 237, v: 238 }, { k: 239, v: 240 }])
  // assemblyDictionary :: dict<guid, faction>
  f.assemblyDictionary([{ k: 241, v: 242 }, { k: 243, v: 244 }])
  // assemblyDictionary :: dict<guid, float>
  f.assemblyDictionary([{ k: 245, v: 246 }, { k: 247, v: 248 }])
  // assemblyDictionary :: dict<guid, guid>
  f.assemblyDictionary([{ k: 249, v: 250 }, { k: 251, v: 252 }])
  // assemblyDictionary :: dict<guid, int>
  f.assemblyDictionary([{ k: 253, v: 254 }, { k: 255, v: 256 }])
  // assemblyDictionary :: dict<guid, list<bool>>
  f.assemblyDictionary([{ k: 257, v: 258 }, { k: 259, v: 260 }])
  // assemblyDictionary :: dict<guid, list<configId>>
  f.assemblyDictionary([{ k: 261, v: 262 }, { k: 263, v: 264 }])
  // assemblyDictionary :: dict<guid, list<entity>>
  f.assemblyDictionary([{ k: 265, v: 266 }, { k: 267, v: 268 }])
  // assemblyDictionary :: dict<guid, list<faction>>
  f.assemblyDictionary([{ k: 269, v: 270 }, { k: 271, v: 272 }])
  // assemblyDictionary :: dict<guid, list<float>>
  f.assemblyDictionary([{ k: 273, v: 274 }, { k: 275, v: 276 }])
  // assemblyDictionary :: dict<guid, list<guid>>
  f.assemblyDictionary([{ k: 277, v: 278 }, { k: 279, v: 280 }])
  // assemblyDictionary :: dict<guid, list<int>>
  f.assemblyDictionary([{ k: 281, v: 282 }, { k: 283, v: 284 }])
  // assemblyDictionary :: dict<guid, list<str>>
  f.assemblyDictionary([{ k: 285, v: 286 }, { k: 287, v: 288 }])
  // assemblyDictionary :: dict<guid, list<vec3>>
  f.assemblyDictionary([{ k: 289, v: 290 }, { k: 291, v: 292 }])
  // assemblyDictionary :: dict<guid, prefabId>
  f.assemblyDictionary([{ k: 293, v: 294 }, { k: 295, v: 296 }])
  // assemblyDictionary :: dict<guid, str>
  f.assemblyDictionary([{ k: 297, v: 298 }, { k: 299, v: 300 }])
  // assemblyDictionary :: dict<guid, vec3>
  f.assemblyDictionary([{ k: 301, v: 302 }, { k: 303, v: 304 }])
  // assemblyDictionary :: dict<int, bool>
  f.assemblyDictionary([{ k: 305, v: 306 }, { k: 307, v: 308 }])
  // assemblyDictionary :: dict<int, configId>
  f.assemblyDictionary([{ k: 309, v: 310 }, { k: 311, v: 312 }])
  // assemblyDictionary :: dict<int, entity>
  f.assemblyDictionary([{ k: 313, v: 314 }, { k: 315, v: 316 }])
  // assemblyDictionary :: dict<int, faction>
  f.assemblyDictionary([{ k: 317, v: 318 }, { k: 319, v: 320 }])
  // assemblyDictionary :: dict<int, float>
  f.assemblyDictionary([{ k: 321, v: 322 }, { k: 323, v: 324 }])
  // assemblyDictionary :: dict<int, guid>
  f.assemblyDictionary([{ k: 325, v: 326 }, { k: 327, v: 328 }])
  // assemblyDictionary :: dict<int, int>
  f.assemblyDictionary([{ k: 329, v: 330 }, { k: 331, v: 332 }])
  // assemblyDictionary :: dict<int, list<bool>>
  f.assemblyDictionary([{ k: 333, v: 334 }, { k: 335, v: 336 }])
  // assemblyDictionary :: dict<int, list<configId>>
  f.assemblyDictionary([{ k: 337, v: 338 }, { k: 339, v: 340 }])
  // assemblyDictionary :: dict<int, list<entity>>
  f.assemblyDictionary([{ k: 341, v: 342 }, { k: 343, v: 344 }])
  // assemblyDictionary :: dict<int, list<faction>>
  f.assemblyDictionary([{ k: 345, v: 346 }, { k: 347, v: 348 }])
  // assemblyDictionary :: dict<int, list<float>>
  f.assemblyDictionary([{ k: 349, v: 350 }, { k: 351, v: 352 }])
  // assemblyDictionary :: dict<int, list<guid>>
  f.assemblyDictionary([{ k: 353, v: 354 }, { k: 355, v: 356 }])
  // assemblyDictionary :: dict<int, list<int>>
  f.assemblyDictionary([{ k: 357, v: 358 }, { k: 359, v: 360 }])
  // assemblyDictionary :: dict<int, list<str>>
  f.assemblyDictionary([{ k: 361, v: 362 }, { k: 363, v: 364 }])
  // assemblyDictionary :: dict<int, list<vec3>>
  f.assemblyDictionary([{ k: 365, v: 366 }, { k: 367, v: 368 }])
  // assemblyDictionary :: dict<int, prefabId>
  f.assemblyDictionary([{ k: 369, v: 370 }, { k: 371, v: 372 }])
  // assemblyDictionary :: dict<int, str>
  f.assemblyDictionary([{ k: 373, v: 374 }, { k: 375, v: 376 }])
  // assemblyDictionary :: dict<int, vec3>
  f.assemblyDictionary([{ k: 377, v: 378 }, { k: 379, v: 380 }])
  // assemblyDictionary :: dict<prefabId, bool>
  f.assemblyDictionary([{ k: 381, v: 382 }, { k: 383, v: 384 }])
  // assemblyDictionary :: dict<prefabId, configId>
  f.assemblyDictionary([{ k: 385, v: 386 }, { k: 387, v: 388 }])
  // assemblyDictionary :: dict<prefabId, entity>
  f.assemblyDictionary([{ k: 389, v: 390 }, { k: 391, v: 392 }])
  // assemblyDictionary :: dict<prefabId, faction>
  f.assemblyDictionary([{ k: 393, v: 394 }, { k: 395, v: 396 }])
  // assemblyDictionary :: dict<prefabId, float>
  f.assemblyDictionary([{ k: 397, v: 398 }, { k: 399, v: 400 }])
  // assemblyDictionary :: dict<prefabId, guid>
  f.assemblyDictionary([{ k: 401, v: 402 }, { k: 403, v: 404 }])
  // assemblyDictionary :: dict<prefabId, int>
  f.assemblyDictionary([{ k: 405, v: 406 }, { k: 407, v: 408 }])
  // assemblyDictionary :: dict<prefabId, list<bool>>
  f.assemblyDictionary([{ k: 409, v: 410 }, { k: 411, v: 412 }])
  // assemblyDictionary :: dict<prefabId, list<configId>>
  f.assemblyDictionary([{ k: 413, v: 414 }, { k: 415, v: 416 }])
  // assemblyDictionary :: dict<prefabId, list<entity>>
  f.assemblyDictionary([{ k: 417, v: 418 }, { k: 419, v: 420 }])
  // assemblyDictionary :: dict<prefabId, list<faction>>
  f.assemblyDictionary([{ k: 421, v: 422 }, { k: 423, v: 424 }])
  // assemblyDictionary :: dict<prefabId, list<float>>
  f.assemblyDictionary([{ k: 425, v: 426 }, { k: 427, v: 428 }])
  // assemblyDictionary :: dict<prefabId, list<guid>>
  f.assemblyDictionary([{ k: 429, v: 430 }, { k: 431, v: 432 }])
  // assemblyDictionary :: dict<prefabId, list<int>>
  f.assemblyDictionary([{ k: 433, v: 434 }, { k: 435, v: 436 }])
  // assemblyDictionary :: dict<prefabId, list<str>>
  f.assemblyDictionary([{ k: 437, v: 438 }, { k: 439, v: 440 }])
  // assemblyDictionary :: dict<prefabId, list<vec3>>
  f.assemblyDictionary([{ k: 441, v: 442 }, { k: 443, v: 444 }])
  // assemblyDictionary :: dict<prefabId, prefabId>
  f.assemblyDictionary([{ k: 445, v: 446 }, { k: 447, v: 448 }])
  // assemblyDictionary :: dict<prefabId, str>
  f.assemblyDictionary([{ k: 449, v: 450 }, { k: 451, v: 452 }])
  // assemblyDictionary :: dict<prefabId, vec3>
  f.assemblyDictionary([{ k: 453, v: 454 }, { k: 455, v: 456 }])
  // assemblyDictionary :: dict<str, bool>
  f.assemblyDictionary([{ k: 457, v: 458 }, { k: 459, v: 460 }])
  // assemblyDictionary :: dict<str, configId>
  f.assemblyDictionary([{ k: 461, v: 462 }, { k: 463, v: 464 }])
  // assemblyDictionary :: dict<str, entity>
  f.assemblyDictionary([{ k: 465, v: 466 }, { k: 467, v: 468 }])
  // assemblyDictionary :: dict<str, faction>
  f.assemblyDictionary([{ k: 469, v: 470 }, { k: 471, v: 472 }])
  // assemblyDictionary :: dict<str, float>
  f.assemblyDictionary([{ k: 473, v: 474 }, { k: 475, v: 476 }])
  // assemblyDictionary :: dict<str, guid>
  f.assemblyDictionary([{ k: 477, v: 478 }, { k: 479, v: 480 }])
  // assemblyDictionary :: dict<str, int>
  f.assemblyDictionary([{ k: 481, v: 482 }, { k: 483, v: 484 }])
  // assemblyDictionary :: dict<str, list<bool>>
  f.assemblyDictionary([{ k: 485, v: 486 }, { k: 487, v: 488 }])
  // assemblyDictionary :: dict<str, list<configId>>
  f.assemblyDictionary([{ k: 489, v: 490 }, { k: 491, v: 492 }])
  // assemblyDictionary :: dict<str, list<entity>>
  f.assemblyDictionary([{ k: 493, v: 494 }, { k: 495, v: 496 }])
  // assemblyDictionary :: dict<str, list<faction>>
  f.assemblyDictionary([{ k: 497, v: 498 }, { k: 499, v: 500 }])
  // assemblyDictionary :: dict<str, list<float>>
  f.assemblyDictionary([{ k: 501, v: 502 }, { k: 503, v: 504 }])
  // assemblyDictionary :: dict<str, list<guid>>
  f.assemblyDictionary([{ k: 505, v: 506 }, { k: 507, v: 508 }])
  // assemblyDictionary :: dict<str, list<int>>
  f.assemblyDictionary([{ k: 509, v: 510 }, { k: 511, v: 512 }])
  // assemblyDictionary :: dict<str, list<str>>
  f.assemblyDictionary([{ k: 513, v: 514 }, { k: 515, v: 516 }])
  // assemblyDictionary :: dict<str, list<vec3>>
  f.assemblyDictionary([{ k: 517, v: 518 }, { k: 519, v: 520 }])
  // assemblyDictionary :: dict<str, prefabId>
  f.assemblyDictionary([{ k: 521, v: 522 }, { k: 523, v: 524 }])
  // assemblyDictionary :: dict<str, str>
  f.assemblyDictionary([{ k: 525, v: 526 }, { k: 527, v: 528 }])
  // assemblyDictionary :: dict<str, vec3>
  f.assemblyDictionary([{ k: 529, v: 530 }, { k: 531, v: 532 }])
  // queryDictionaryValueByKey :: dict<configId, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]), new configId(6n))
  // queryDictionaryValueByKey :: dict<configId, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(8n), v: new configId(9n) }, { k: new configId(10n), v: new configId(11n) }]), new configId(12n))
  // queryDictionaryValueByKey :: dict<configId, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(14n), v: f.getSelfEntity() }, { k: new configId(16n), v: f.getSelfEntity() }]), new configId(18n))
  // queryDictionaryValueByKey :: dict<configId, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(20n), v: new faction(21n) }, { k: new configId(22n), v: new faction(23n) }]), new configId(24n))
  // queryDictionaryValueByKey :: dict<configId, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(26n), v: 27.25 }, { k: new configId(28n), v: 29.25 }]), new configId(30n))
  // queryDictionaryValueByKey :: dict<configId, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(32n), v: new guid(33n) }, { k: new configId(34n), v: new guid(35n) }]), new configId(36n))
  // queryDictionaryValueByKey :: dict<configId, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(38n), v: 39n }, { k: new configId(40n), v: 41n }]), new configId(42n))
  // queryDictionaryValueByKey :: dict<configId, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(44n), v: f.assemblyList([true, false, true], "bool") }, { k: new configId(46n), v: f.assemblyList([true, false, true], "bool") }]), new configId(48n))
  // queryDictionaryValueByKey :: dict<configId, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(50n), v: f.assemblyList([51n, 52n, 53n], "config_id") }, { k: new configId(52n), v: f.assemblyList([53n, 54n, 55n], "config_id") }]), new configId(54n))
  // queryDictionaryValueByKey :: dict<configId, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(56n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new configId(59n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new configId(62n))
  // queryDictionaryValueByKey :: dict<configId, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(64n), v: f.assemblyList([65n, 66n, 67n], "faction") }, { k: new configId(66n), v: f.assemblyList([67n, 68n, 69n], "faction") }]), new configId(68n))
  // queryDictionaryValueByKey :: dict<configId, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(70n), v: f.assemblyList([71.25, 72.25, 73.25], "float") }, { k: new configId(72n), v: f.assemblyList([73.25, 74.25, 75.25], "float") }]), new configId(74n))
  // queryDictionaryValueByKey :: dict<configId, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(76n), v: f.assemblyList([77n, 78n, 79n], "guid") }, { k: new configId(78n), v: f.assemblyList([79n, 80n, 81n], "guid") }]), new configId(80n))
  // queryDictionaryValueByKey :: dict<configId, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(82n), v: f.assemblyList([83n, 84n, 85n], "int") }, { k: new configId(84n), v: f.assemblyList([85n, 86n, 87n], "int") }]), new configId(86n))
  // queryDictionaryValueByKey :: dict<configId, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(88n), v: f.assemblyList(["89", "90", "91"], "str") }, { k: new configId(90n), v: f.assemblyList(["91", "92", "93"], "str") }]), new configId(92n))
  // queryDictionaryValueByKey :: dict<configId, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(94n), v: f.assemblyList([[95, 96, 97], [96, 97, 98], [97, 98, 99]], "vec3") }, { k: new configId(96n), v: f.assemblyList([[97, 98, 99], [98, 99, 100], [99, 100, 101]], "vec3") }]), new configId(98n))
  // queryDictionaryValueByKey :: dict<configId, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(100n), v: new prefabId(101n) }, { k: new configId(102n), v: new prefabId(103n) }]), new configId(104n))
  // queryDictionaryValueByKey :: dict<configId, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(106n), v: "107" }, { k: new configId(108n), v: "109" }]), new configId(110n))
  // queryDictionaryValueByKey :: dict<configId, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new configId(112n), v: f.create3dVector(113, 114, 115) }, { k: new configId(114n), v: f.create3dVector(115, 116, 117) }]), new configId(116n))
  // queryDictionaryValueByKey :: dict<entity, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: true }, { k: f.getSelfEntity(), v: true }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(125n) }, { k: f.getSelfEntity(), v: new configId(127n) }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(137n) }, { k: f.getSelfEntity(), v: new faction(139n) }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 143.25 }, { k: f.getSelfEntity(), v: 145.25 }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(149n) }, { k: f.getSelfEntity(), v: new guid(151n) }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 155n }, { k: f.getSelfEntity(), v: 157n }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }, { k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([167n, 168n, 169n], "config_id") }, { k: f.getSelfEntity(), v: f.assemblyList([169n, 170n, 171n], "config_id") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([181n, 182n, 183n], "faction") }, { k: f.getSelfEntity(), v: f.assemblyList([183n, 184n, 185n], "faction") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([187.25, 188.25, 189.25], "float") }, { k: f.getSelfEntity(), v: f.assemblyList([189.25, 190.25, 191.25], "float") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([193n, 194n, 195n], "guid") }, { k: f.getSelfEntity(), v: f.assemblyList([195n, 196n, 197n], "guid") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([199n, 200n, 201n], "int") }, { k: f.getSelfEntity(), v: f.assemblyList([201n, 202n, 203n], "int") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList(["205", "206", "207"], "str") }, { k: f.getSelfEntity(), v: f.assemblyList(["207", "208", "209"], "str") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([[211, 212, 213], [212, 213, 214], [213, 214, 215]], "vec3") }, { k: f.getSelfEntity(), v: f.assemblyList([[213, 214, 215], [214, 215, 216], [215, 216, 217]], "vec3") }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(217n) }, { k: f.getSelfEntity(), v: new prefabId(219n) }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "223" }, { k: f.getSelfEntity(), v: "225" }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<entity, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(229, 230, 231) }, { k: f.getSelfEntity(), v: f.create3dVector(231, 232, 233) }]), f.getSelfEntity())
  // queryDictionaryValueByKey :: dict<faction, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(234n), v: true }, { k: new faction(236n), v: true }]), new faction(238n))
  // queryDictionaryValueByKey :: dict<faction, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(240n), v: new configId(241n) }, { k: new faction(242n), v: new configId(243n) }]), new faction(244n))
  // queryDictionaryValueByKey :: dict<faction, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(246n), v: f.getSelfEntity() }, { k: new faction(248n), v: f.getSelfEntity() }]), new faction(250n))
  // queryDictionaryValueByKey :: dict<faction, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(252n), v: new faction(253n) }, { k: new faction(254n), v: new faction(255n) }]), new faction(256n))
  // queryDictionaryValueByKey :: dict<faction, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(258n), v: 259.25 }, { k: new faction(260n), v: 261.25 }]), new faction(262n))
  // queryDictionaryValueByKey :: dict<faction, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(264n), v: new guid(265n) }, { k: new faction(266n), v: new guid(267n) }]), new faction(268n))
  // queryDictionaryValueByKey :: dict<faction, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(270n), v: 271n }, { k: new faction(272n), v: 273n }]), new faction(274n))
  // queryDictionaryValueByKey :: dict<faction, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(276n), v: f.assemblyList([true, false, true], "bool") }, { k: new faction(278n), v: f.assemblyList([true, false, true], "bool") }]), new faction(280n))
  // queryDictionaryValueByKey :: dict<faction, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(282n), v: f.assemblyList([283n, 284n, 285n], "config_id") }, { k: new faction(284n), v: f.assemblyList([285n, 286n, 287n], "config_id") }]), new faction(286n))
  // queryDictionaryValueByKey :: dict<faction, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(288n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new faction(291n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new faction(294n))
  // queryDictionaryValueByKey :: dict<faction, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(296n), v: f.assemblyList([297n, 298n, 299n], "faction") }, { k: new faction(298n), v: f.assemblyList([299n, 300n, 301n], "faction") }]), new faction(300n))
  // queryDictionaryValueByKey :: dict<faction, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(302n), v: f.assemblyList([303.25, 304.25, 305.25], "float") }, { k: new faction(304n), v: f.assemblyList([305.25, 306.25, 307.25], "float") }]), new faction(306n))
  // queryDictionaryValueByKey :: dict<faction, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(308n), v: f.assemblyList([309n, 310n, 311n], "guid") }, { k: new faction(310n), v: f.assemblyList([311n, 312n, 313n], "guid") }]), new faction(312n))
  // queryDictionaryValueByKey :: dict<faction, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(314n), v: f.assemblyList([315n, 316n, 317n], "int") }, { k: new faction(316n), v: f.assemblyList([317n, 318n, 319n], "int") }]), new faction(318n))
  // queryDictionaryValueByKey :: dict<faction, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(320n), v: f.assemblyList(["321", "322", "323"], "str") }, { k: new faction(322n), v: f.assemblyList(["323", "324", "325"], "str") }]), new faction(324n))
  // queryDictionaryValueByKey :: dict<faction, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(326n), v: f.assemblyList([[327, 328, 329], [328, 329, 330], [329, 330, 331]], "vec3") }, { k: new faction(328n), v: f.assemblyList([[329, 330, 331], [330, 331, 332], [331, 332, 333]], "vec3") }]), new faction(330n))
  // queryDictionaryValueByKey :: dict<faction, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(332n), v: new prefabId(333n) }, { k: new faction(334n), v: new prefabId(335n) }]), new faction(336n))
  // queryDictionaryValueByKey :: dict<faction, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(338n), v: "339" }, { k: new faction(340n), v: "341" }]), new faction(342n))
  // queryDictionaryValueByKey :: dict<faction, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new faction(344n), v: f.create3dVector(345, 346, 347) }, { k: new faction(346n), v: f.create3dVector(347, 348, 349) }]), new faction(348n))
  // queryDictionaryValueByKey :: dict<guid, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(350n), v: true }, { k: new guid(352n), v: true }]), new guid(354n))
  // queryDictionaryValueByKey :: dict<guid, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(356n), v: new configId(357n) }, { k: new guid(358n), v: new configId(359n) }]), new guid(360n))
  // queryDictionaryValueByKey :: dict<guid, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(362n), v: f.getSelfEntity() }, { k: new guid(364n), v: f.getSelfEntity() }]), new guid(366n))
  // queryDictionaryValueByKey :: dict<guid, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(368n), v: new faction(369n) }, { k: new guid(370n), v: new faction(371n) }]), new guid(372n))
  // queryDictionaryValueByKey :: dict<guid, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(374n), v: 375.25 }, { k: new guid(376n), v: 377.25 }]), new guid(378n))
  // queryDictionaryValueByKey :: dict<guid, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(380n), v: new guid(381n) }, { k: new guid(382n), v: new guid(383n) }]), new guid(384n))
  // queryDictionaryValueByKey :: dict<guid, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(386n), v: 387n }, { k: new guid(388n), v: 389n }]), new guid(390n))
  // queryDictionaryValueByKey :: dict<guid, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(392n), v: f.assemblyList([true, false, true], "bool") }, { k: new guid(394n), v: f.assemblyList([true, false, true], "bool") }]), new guid(396n))
  // queryDictionaryValueByKey :: dict<guid, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(398n), v: f.assemblyList([399n, 400n, 401n], "config_id") }, { k: new guid(400n), v: f.assemblyList([401n, 402n, 403n], "config_id") }]), new guid(402n))
  // queryDictionaryValueByKey :: dict<guid, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(404n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new guid(407n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new guid(410n))
  // queryDictionaryValueByKey :: dict<guid, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(412n), v: f.assemblyList([413n, 414n, 415n], "faction") }, { k: new guid(414n), v: f.assemblyList([415n, 416n, 417n], "faction") }]), new guid(416n))
  // queryDictionaryValueByKey :: dict<guid, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(418n), v: f.assemblyList([419.25, 420.25, 421.25], "float") }, { k: new guid(420n), v: f.assemblyList([421.25, 422.25, 423.25], "float") }]), new guid(422n))
  // queryDictionaryValueByKey :: dict<guid, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(424n), v: f.assemblyList([425n, 426n, 427n], "guid") }, { k: new guid(426n), v: f.assemblyList([427n, 428n, 429n], "guid") }]), new guid(428n))
  // queryDictionaryValueByKey :: dict<guid, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(430n), v: f.assemblyList([431n, 432n, 433n], "int") }, { k: new guid(432n), v: f.assemblyList([433n, 434n, 435n], "int") }]), new guid(434n))
  // queryDictionaryValueByKey :: dict<guid, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(436n), v: f.assemblyList(["437", "438", "439"], "str") }, { k: new guid(438n), v: f.assemblyList(["439", "440", "441"], "str") }]), new guid(440n))
  // queryDictionaryValueByKey :: dict<guid, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(442n), v: f.assemblyList([[443, 444, 445], [444, 445, 446], [445, 446, 447]], "vec3") }, { k: new guid(444n), v: f.assemblyList([[445, 446, 447], [446, 447, 448], [447, 448, 449]], "vec3") }]), new guid(446n))
  // queryDictionaryValueByKey :: dict<guid, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(448n), v: new prefabId(449n) }, { k: new guid(450n), v: new prefabId(451n) }]), new guid(452n))
  // queryDictionaryValueByKey :: dict<guid, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(454n), v: "455" }, { k: new guid(456n), v: "457" }]), new guid(458n))
  // queryDictionaryValueByKey :: dict<guid, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new guid(460n), v: f.create3dVector(461, 462, 463) }, { k: new guid(462n), v: f.create3dVector(463, 464, 465) }]), new guid(464n))
  // queryDictionaryValueByKey :: dict<int, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 466n, v: true }, { k: 468n, v: true }]), 470n)
  // queryDictionaryValueByKey :: dict<int, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 472n, v: new configId(473n) }, { k: 474n, v: new configId(475n) }]), 476n)
  // queryDictionaryValueByKey :: dict<int, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 478n, v: f.getSelfEntity() }, { k: 480n, v: f.getSelfEntity() }]), 482n)
  // queryDictionaryValueByKey :: dict<int, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 484n, v: new faction(485n) }, { k: 486n, v: new faction(487n) }]), 488n)
  // queryDictionaryValueByKey :: dict<int, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 490n, v: 491.25 }, { k: 492n, v: 493.25 }]), 494n)
  // queryDictionaryValueByKey :: dict<int, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 496n, v: new guid(497n) }, { k: 498n, v: new guid(499n) }]), 500n)
  // queryDictionaryValueByKey :: dict<int, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 502n, v: 503n }, { k: 504n, v: 505n }]), 506n)
  // queryDictionaryValueByKey :: dict<int, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 508n, v: f.assemblyList([true, false, true], "bool") }, { k: 510n, v: f.assemblyList([true, false, true], "bool") }]), 512n)
  // queryDictionaryValueByKey :: dict<int, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 514n, v: f.assemblyList([515n, 516n, 517n], "config_id") }, { k: 516n, v: f.assemblyList([517n, 518n, 519n], "config_id") }]), 518n)
  // queryDictionaryValueByKey :: dict<int, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 520n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: 523n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), 526n)
  // queryDictionaryValueByKey :: dict<int, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 528n, v: f.assemblyList([529n, 530n, 531n], "faction") }, { k: 530n, v: f.assemblyList([531n, 532n, 533n], "faction") }]), 532n)
  // queryDictionaryValueByKey :: dict<int, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 534n, v: f.assemblyList([535.25, 536.25, 537.25], "float") }, { k: 536n, v: f.assemblyList([537.25, 538.25, 539.25], "float") }]), 538n)
  // queryDictionaryValueByKey :: dict<int, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 540n, v: f.assemblyList([541n, 542n, 543n], "guid") }, { k: 542n, v: f.assemblyList([543n, 544n, 545n], "guid") }]), 544n)
  // queryDictionaryValueByKey :: dict<int, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 546n, v: f.assemblyList([547n, 548n, 549n], "int") }, { k: 548n, v: f.assemblyList([549n, 550n, 551n], "int") }]), 550n)
  // queryDictionaryValueByKey :: dict<int, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 552n, v: f.assemblyList(["553", "554", "555"], "str") }, { k: 554n, v: f.assemblyList(["555", "556", "557"], "str") }]), 556n)
  // queryDictionaryValueByKey :: dict<int, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 558n, v: f.assemblyList([[559, 560, 561], [560, 561, 562], [561, 562, 563]], "vec3") }, { k: 560n, v: f.assemblyList([[561, 562, 563], [562, 563, 564], [563, 564, 565]], "vec3") }]), 562n)
  // queryDictionaryValueByKey :: dict<int, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 564n, v: new prefabId(565n) }, { k: 566n, v: new prefabId(567n) }]), 568n)
  // queryDictionaryValueByKey :: dict<int, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 570n, v: "571" }, { k: 572n, v: "573" }]), 574n)
  // queryDictionaryValueByKey :: dict<int, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: 576n, v: f.create3dVector(577, 578, 579) }, { k: 578n, v: f.create3dVector(579, 580, 581) }]), 580n)
  // queryDictionaryValueByKey :: dict<prefabId, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(582n), v: true }, { k: new prefabId(584n), v: true }]), new prefabId(586n))
  // queryDictionaryValueByKey :: dict<prefabId, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(588n), v: new configId(589n) }, { k: new prefabId(590n), v: new configId(591n) }]), new prefabId(592n))
  // queryDictionaryValueByKey :: dict<prefabId, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(594n), v: f.getSelfEntity() }, { k: new prefabId(596n), v: f.getSelfEntity() }]), new prefabId(598n))
  // queryDictionaryValueByKey :: dict<prefabId, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(600n), v: new faction(601n) }, { k: new prefabId(602n), v: new faction(603n) }]), new prefabId(604n))
  // queryDictionaryValueByKey :: dict<prefabId, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(606n), v: 607.25 }, { k: new prefabId(608n), v: 609.25 }]), new prefabId(610n))
  // queryDictionaryValueByKey :: dict<prefabId, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(612n), v: new guid(613n) }, { k: new prefabId(614n), v: new guid(615n) }]), new prefabId(616n))
  // queryDictionaryValueByKey :: dict<prefabId, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(618n), v: 619n }, { k: new prefabId(620n), v: 621n }]), new prefabId(622n))
  // queryDictionaryValueByKey :: dict<prefabId, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(624n), v: f.assemblyList([true, false, true], "bool") }, { k: new prefabId(626n), v: f.assemblyList([true, false, true], "bool") }]), new prefabId(628n))
  // queryDictionaryValueByKey :: dict<prefabId, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(630n), v: f.assemblyList([631n, 632n, 633n], "config_id") }, { k: new prefabId(632n), v: f.assemblyList([633n, 634n, 635n], "config_id") }]), new prefabId(634n))
  // queryDictionaryValueByKey :: dict<prefabId, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(636n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new prefabId(639n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new prefabId(642n))
  // queryDictionaryValueByKey :: dict<prefabId, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(644n), v: f.assemblyList([645n, 646n, 647n], "faction") }, { k: new prefabId(646n), v: f.assemblyList([647n, 648n, 649n], "faction") }]), new prefabId(648n))
  // queryDictionaryValueByKey :: dict<prefabId, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(650n), v: f.assemblyList([651.25, 652.25, 653.25], "float") }, { k: new prefabId(652n), v: f.assemblyList([653.25, 654.25, 655.25], "float") }]), new prefabId(654n))
  // queryDictionaryValueByKey :: dict<prefabId, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(656n), v: f.assemblyList([657n, 658n, 659n], "guid") }, { k: new prefabId(658n), v: f.assemblyList([659n, 660n, 661n], "guid") }]), new prefabId(660n))
  // queryDictionaryValueByKey :: dict<prefabId, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(662n), v: f.assemblyList([663n, 664n, 665n], "int") }, { k: new prefabId(664n), v: f.assemblyList([665n, 666n, 667n], "int") }]), new prefabId(666n))
  // queryDictionaryValueByKey :: dict<prefabId, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(668n), v: f.assemblyList(["669", "670", "671"], "str") }, { k: new prefabId(670n), v: f.assemblyList(["671", "672", "673"], "str") }]), new prefabId(672n))
  // queryDictionaryValueByKey :: dict<prefabId, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(674n), v: f.assemblyList([[675, 676, 677], [676, 677, 678], [677, 678, 679]], "vec3") }, { k: new prefabId(676n), v: f.assemblyList([[677, 678, 679], [678, 679, 680], [679, 680, 681]], "vec3") }]), new prefabId(678n))
  // queryDictionaryValueByKey :: dict<prefabId, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(680n), v: new prefabId(681n) }, { k: new prefabId(682n), v: new prefabId(683n) }]), new prefabId(684n))
  // queryDictionaryValueByKey :: dict<prefabId, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(686n), v: "687" }, { k: new prefabId(688n), v: "689" }]), new prefabId(690n))
  // queryDictionaryValueByKey :: dict<prefabId, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: new prefabId(692n), v: f.create3dVector(693, 694, 695) }, { k: new prefabId(694n), v: f.create3dVector(695, 696, 697) }]), new prefabId(696n))
  // queryDictionaryValueByKey :: dict<str, bool>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "698", v: true }, { k: "700", v: true }]), "702")
  // queryDictionaryValueByKey :: dict<str, configId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "704", v: new configId(705n) }, { k: "706", v: new configId(707n) }]), "708")
  // queryDictionaryValueByKey :: dict<str, entity>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "710", v: f.getSelfEntity() }, { k: "712", v: f.getSelfEntity() }]), "714")
  // queryDictionaryValueByKey :: dict<str, faction>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "716", v: new faction(717n) }, { k: "718", v: new faction(719n) }]), "720")
  // queryDictionaryValueByKey :: dict<str, float>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "722", v: 723.25 }, { k: "724", v: 725.25 }]), "726")
  // queryDictionaryValueByKey :: dict<str, guid>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "728", v: new guid(729n) }, { k: "730", v: new guid(731n) }]), "732")
  // queryDictionaryValueByKey :: dict<str, int>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "734", v: 735n }, { k: "736", v: 737n }]), "738")
  // queryDictionaryValueByKey :: dict<str, list<bool>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "740", v: f.assemblyList([true, false, true], "bool") }, { k: "742", v: f.assemblyList([true, false, true], "bool") }]), "744")
  // queryDictionaryValueByKey :: dict<str, list<configId>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "746", v: f.assemblyList([747n, 748n, 749n], "config_id") }, { k: "748", v: f.assemblyList([749n, 750n, 751n], "config_id") }]), "750")
  // queryDictionaryValueByKey :: dict<str, list<entity>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "752", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: "755", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), "758")
  // queryDictionaryValueByKey :: dict<str, list<faction>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "760", v: f.assemblyList([761n, 762n, 763n], "faction") }, { k: "762", v: f.assemblyList([763n, 764n, 765n], "faction") }]), "764")
  // queryDictionaryValueByKey :: dict<str, list<float>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "766", v: f.assemblyList([767.25, 768.25, 769.25], "float") }, { k: "768", v: f.assemblyList([769.25, 770.25, 771.25], "float") }]), "770")
  // queryDictionaryValueByKey :: dict<str, list<guid>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "772", v: f.assemblyList([773n, 774n, 775n], "guid") }, { k: "774", v: f.assemblyList([775n, 776n, 777n], "guid") }]), "776")
  // queryDictionaryValueByKey :: dict<str, list<int>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "778", v: f.assemblyList([779n, 780n, 781n], "int") }, { k: "780", v: f.assemblyList([781n, 782n, 783n], "int") }]), "782")
  // queryDictionaryValueByKey :: dict<str, list<str>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "784", v: f.assemblyList(["785", "786", "787"], "str") }, { k: "786", v: f.assemblyList(["787", "788", "789"], "str") }]), "788")
  // queryDictionaryValueByKey :: dict<str, list<vec3>>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "790", v: f.assemblyList([[791, 792, 793], [792, 793, 794], [793, 794, 795]], "vec3") }, { k: "792", v: f.assemblyList([[793, 794, 795], [794, 795, 796], [795, 796, 797]], "vec3") }]), "794")
  // queryDictionaryValueByKey :: dict<str, prefabId>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "796", v: new prefabId(797n) }, { k: "798", v: new prefabId(799n) }]), "800")
  // queryDictionaryValueByKey :: dict<str, str>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "802", v: "803" }, { k: "804", v: "805" }]), "806")
  // queryDictionaryValueByKey :: dict<str, vec3>
  f.queryDictionaryValueByKey(f.assemblyDictionary([{ k: "808", v: f.create3dVector(809, 810, 811) }, { k: "810", v: f.create3dVector(811, 812, 813) }]), "812")
  // setOrAddKeyValuePairsToDictionary :: dict<configId, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]), new configId(6n), true)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(9n), v: new configId(10n) }, { k: new configId(11n), v: new configId(12n) }]), new configId(13n), new configId(14n))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(16n), v: f.getSelfEntity() }, { k: new configId(18n), v: f.getSelfEntity() }]), new configId(20n), f.getSelfEntity())
  // setOrAddKeyValuePairsToDictionary :: dict<configId, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(23n), v: new faction(24n) }, { k: new configId(25n), v: new faction(26n) }]), new configId(27n), new faction(28n))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(30n), v: 31.25 }, { k: new configId(32n), v: 33.25 }]), new configId(34n), 35.25)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(37n), v: new guid(38n) }, { k: new configId(39n), v: new guid(40n) }]), new configId(41n), new guid(42n))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(44n), v: 45n }, { k: new configId(46n), v: 47n }]), new configId(48n), 49n)
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(51n), v: f.assemblyList([false, true, false], "bool") }, { k: new configId(53n), v: f.assemblyList([false, true, false], "bool") }]), new configId(55n), f.assemblyList([false, true, false], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(58n), v: f.assemblyList([59n, 60n, 61n], "config_id") }, { k: new configId(60n), v: f.assemblyList([61n, 62n, 63n], "config_id") }]), new configId(62n), f.assemblyList([63n, 64n, 65n], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(65n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new configId(68n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new configId(71n), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(75n), v: f.assemblyList([76n, 77n, 78n], "faction") }, { k: new configId(77n), v: f.assemblyList([78n, 79n, 80n], "faction") }]), new configId(79n), f.assemblyList([80n, 81n, 82n], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(82n), v: f.assemblyList([83.25, 84.25, 85.25], "float") }, { k: new configId(84n), v: f.assemblyList([85.25, 86.25, 87.25], "float") }]), new configId(86n), f.assemblyList([87.25, 88.25, 89.25], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(89n), v: f.assemblyList([90n, 91n, 92n], "guid") }, { k: new configId(91n), v: f.assemblyList([92n, 93n, 94n], "guid") }]), new configId(93n), f.assemblyList([94n, 95n, 96n], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(96n), v: f.assemblyList([97n, 98n, 99n], "int") }, { k: new configId(98n), v: f.assemblyList([99n, 100n, 101n], "int") }]), new configId(100n), f.assemblyList([101n, 102n, 103n], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(103n), v: f.assemblyList(["104", "105", "106"], "str") }, { k: new configId(105n), v: f.assemblyList(["106", "107", "108"], "str") }]), new configId(107n), f.assemblyList(["108", "109", "110"], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(110n), v: f.assemblyList([[111, 112, 113], [112, 113, 114], [113, 114, 115]], "vec3") }, { k: new configId(112n), v: f.assemblyList([[113, 114, 115], [114, 115, 116], [115, 116, 117]], "vec3") }]), new configId(114n), f.assemblyList([[115, 116, 117], [116, 117, 118], [117, 118, 119]], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(117n), v: new prefabId(118n) }, { k: new configId(119n), v: new prefabId(120n) }]), new configId(121n), new prefabId(122n))
  // setOrAddKeyValuePairsToDictionary :: dict<configId, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(124n), v: "125" }, { k: new configId(126n), v: "127" }]), new configId(128n), "129")
  // setOrAddKeyValuePairsToDictionary :: dict<configId, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new configId(131n), v: f.create3dVector(132, 133, 134) }, { k: new configId(133n), v: f.create3dVector(134, 135, 136) }]), new configId(135n), f.create3dVector(136, 137, 138))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: true }, { k: f.getSelfEntity(), v: true }]), f.getSelfEntity(), true)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(146n) }, { k: f.getSelfEntity(), v: new configId(148n) }]), f.getSelfEntity(), new configId(150n))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]), f.getSelfEntity(), f.getSelfEntity())
  // setOrAddKeyValuePairsToDictionary :: dict<entity, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(160n) }, { k: f.getSelfEntity(), v: new faction(162n) }]), f.getSelfEntity(), new faction(164n))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 167.25 }, { k: f.getSelfEntity(), v: 169.25 }]), f.getSelfEntity(), 171.25)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(174n) }, { k: f.getSelfEntity(), v: new guid(176n) }]), f.getSelfEntity(), new guid(178n))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 181n }, { k: f.getSelfEntity(), v: 183n }]), f.getSelfEntity(), 185n)
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([false, true, false], "bool") }, { k: f.getSelfEntity(), v: f.assemblyList([false, true, false], "bool") }]), f.getSelfEntity(), f.assemblyList([false, true, false], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([195n, 196n, 197n], "config_id") }, { k: f.getSelfEntity(), v: f.assemblyList([197n, 198n, 199n], "config_id") }]), f.getSelfEntity(), f.assemblyList([199n, 200n, 201n], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), f.getSelfEntity(), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([212n, 213n, 214n], "faction") }, { k: f.getSelfEntity(), v: f.assemblyList([214n, 215n, 216n], "faction") }]), f.getSelfEntity(), f.assemblyList([216n, 217n, 218n], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([219.25, 220.25, 221.25], "float") }, { k: f.getSelfEntity(), v: f.assemblyList([221.25, 222.25, 223.25], "float") }]), f.getSelfEntity(), f.assemblyList([223.25, 224.25, 225.25], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([226n, 227n, 228n], "guid") }, { k: f.getSelfEntity(), v: f.assemblyList([228n, 229n, 230n], "guid") }]), f.getSelfEntity(), f.assemblyList([230n, 231n, 232n], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([233n, 234n, 235n], "int") }, { k: f.getSelfEntity(), v: f.assemblyList([235n, 236n, 237n], "int") }]), f.getSelfEntity(), f.assemblyList([237n, 238n, 239n], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList(["240", "241", "242"], "str") }, { k: f.getSelfEntity(), v: f.assemblyList(["242", "243", "244"], "str") }]), f.getSelfEntity(), f.assemblyList(["244", "245", "246"], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([[247, 248, 249], [248, 249, 250], [249, 250, 251]], "vec3") }, { k: f.getSelfEntity(), v: f.assemblyList([[249, 250, 251], [250, 251, 252], [251, 252, 253]], "vec3") }]), f.getSelfEntity(), f.assemblyList([[251, 252, 253], [252, 253, 254], [253, 254, 255]], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(254n) }, { k: f.getSelfEntity(), v: new prefabId(256n) }]), f.getSelfEntity(), new prefabId(258n))
  // setOrAddKeyValuePairsToDictionary :: dict<entity, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "261" }, { k: f.getSelfEntity(), v: "263" }]), f.getSelfEntity(), "265")
  // setOrAddKeyValuePairsToDictionary :: dict<entity, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(268, 269, 270) }, { k: f.getSelfEntity(), v: f.create3dVector(270, 271, 272) }]), f.getSelfEntity(), f.create3dVector(272, 273, 274))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(274n), v: true }, { k: new faction(276n), v: true }]), new faction(278n), true)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(281n), v: new configId(282n) }, { k: new faction(283n), v: new configId(284n) }]), new faction(285n), new configId(286n))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(288n), v: f.getSelfEntity() }, { k: new faction(290n), v: f.getSelfEntity() }]), new faction(292n), f.getSelfEntity())
  // setOrAddKeyValuePairsToDictionary :: dict<faction, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(295n), v: new faction(296n) }, { k: new faction(297n), v: new faction(298n) }]), new faction(299n), new faction(300n))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(302n), v: 303.25 }, { k: new faction(304n), v: 305.25 }]), new faction(306n), 307.25)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(309n), v: new guid(310n) }, { k: new faction(311n), v: new guid(312n) }]), new faction(313n), new guid(314n))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(316n), v: 317n }, { k: new faction(318n), v: 319n }]), new faction(320n), 321n)
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(323n), v: f.assemblyList([false, true, false], "bool") }, { k: new faction(325n), v: f.assemblyList([false, true, false], "bool") }]), new faction(327n), f.assemblyList([false, true, false], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(330n), v: f.assemblyList([331n, 332n, 333n], "config_id") }, { k: new faction(332n), v: f.assemblyList([333n, 334n, 335n], "config_id") }]), new faction(334n), f.assemblyList([335n, 336n, 337n], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(337n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new faction(340n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new faction(343n), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(347n), v: f.assemblyList([348n, 349n, 350n], "faction") }, { k: new faction(349n), v: f.assemblyList([350n, 351n, 352n], "faction") }]), new faction(351n), f.assemblyList([352n, 353n, 354n], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(354n), v: f.assemblyList([355.25, 356.25, 357.25], "float") }, { k: new faction(356n), v: f.assemblyList([357.25, 358.25, 359.25], "float") }]), new faction(358n), f.assemblyList([359.25, 360.25, 361.25], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(361n), v: f.assemblyList([362n, 363n, 364n], "guid") }, { k: new faction(363n), v: f.assemblyList([364n, 365n, 366n], "guid") }]), new faction(365n), f.assemblyList([366n, 367n, 368n], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(368n), v: f.assemblyList([369n, 370n, 371n], "int") }, { k: new faction(370n), v: f.assemblyList([371n, 372n, 373n], "int") }]), new faction(372n), f.assemblyList([373n, 374n, 375n], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(375n), v: f.assemblyList(["376", "377", "378"], "str") }, { k: new faction(377n), v: f.assemblyList(["378", "379", "380"], "str") }]), new faction(379n), f.assemblyList(["380", "381", "382"], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(382n), v: f.assemblyList([[383, 384, 385], [384, 385, 386], [385, 386, 387]], "vec3") }, { k: new faction(384n), v: f.assemblyList([[385, 386, 387], [386, 387, 388], [387, 388, 389]], "vec3") }]), new faction(386n), f.assemblyList([[387, 388, 389], [388, 389, 390], [389, 390, 391]], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(389n), v: new prefabId(390n) }, { k: new faction(391n), v: new prefabId(392n) }]), new faction(393n), new prefabId(394n))
  // setOrAddKeyValuePairsToDictionary :: dict<faction, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(396n), v: "397" }, { k: new faction(398n), v: "399" }]), new faction(400n), "401")
  // setOrAddKeyValuePairsToDictionary :: dict<faction, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new faction(403n), v: f.create3dVector(404, 405, 406) }, { k: new faction(405n), v: f.create3dVector(406, 407, 408) }]), new faction(407n), f.create3dVector(408, 409, 410))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(410n), v: true }, { k: new guid(412n), v: true }]), new guid(414n), true)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(417n), v: new configId(418n) }, { k: new guid(419n), v: new configId(420n) }]), new guid(421n), new configId(422n))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(424n), v: f.getSelfEntity() }, { k: new guid(426n), v: f.getSelfEntity() }]), new guid(428n), f.getSelfEntity())
  // setOrAddKeyValuePairsToDictionary :: dict<guid, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(431n), v: new faction(432n) }, { k: new guid(433n), v: new faction(434n) }]), new guid(435n), new faction(436n))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(438n), v: 439.25 }, { k: new guid(440n), v: 441.25 }]), new guid(442n), 443.25)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(445n), v: new guid(446n) }, { k: new guid(447n), v: new guid(448n) }]), new guid(449n), new guid(450n))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(452n), v: 453n }, { k: new guid(454n), v: 455n }]), new guid(456n), 457n)
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(459n), v: f.assemblyList([false, true, false], "bool") }, { k: new guid(461n), v: f.assemblyList([false, true, false], "bool") }]), new guid(463n), f.assemblyList([false, true, false], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(466n), v: f.assemblyList([467n, 468n, 469n], "config_id") }, { k: new guid(468n), v: f.assemblyList([469n, 470n, 471n], "config_id") }]), new guid(470n), f.assemblyList([471n, 472n, 473n], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(473n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new guid(476n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new guid(479n), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(483n), v: f.assemblyList([484n, 485n, 486n], "faction") }, { k: new guid(485n), v: f.assemblyList([486n, 487n, 488n], "faction") }]), new guid(487n), f.assemblyList([488n, 489n, 490n], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(490n), v: f.assemblyList([491.25, 492.25, 493.25], "float") }, { k: new guid(492n), v: f.assemblyList([493.25, 494.25, 495.25], "float") }]), new guid(494n), f.assemblyList([495.25, 496.25, 497.25], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(497n), v: f.assemblyList([498n, 499n, 500n], "guid") }, { k: new guid(499n), v: f.assemblyList([500n, 501n, 502n], "guid") }]), new guid(501n), f.assemblyList([502n, 503n, 504n], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(504n), v: f.assemblyList([505n, 506n, 507n], "int") }, { k: new guid(506n), v: f.assemblyList([507n, 508n, 509n], "int") }]), new guid(508n), f.assemblyList([509n, 510n, 511n], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(511n), v: f.assemblyList(["512", "513", "514"], "str") }, { k: new guid(513n), v: f.assemblyList(["514", "515", "516"], "str") }]), new guid(515n), f.assemblyList(["516", "517", "518"], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(518n), v: f.assemblyList([[519, 520, 521], [520, 521, 522], [521, 522, 523]], "vec3") }, { k: new guid(520n), v: f.assemblyList([[521, 522, 523], [522, 523, 524], [523, 524, 525]], "vec3") }]), new guid(522n), f.assemblyList([[523, 524, 525], [524, 525, 526], [525, 526, 527]], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(525n), v: new prefabId(526n) }, { k: new guid(527n), v: new prefabId(528n) }]), new guid(529n), new prefabId(530n))
  // setOrAddKeyValuePairsToDictionary :: dict<guid, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(532n), v: "533" }, { k: new guid(534n), v: "535" }]), new guid(536n), "537")
  // setOrAddKeyValuePairsToDictionary :: dict<guid, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new guid(539n), v: f.create3dVector(540, 541, 542) }, { k: new guid(541n), v: f.create3dVector(542, 543, 544) }]), new guid(543n), f.create3dVector(544, 545, 546))
  // setOrAddKeyValuePairsToDictionary :: dict<int, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 546n, v: true }, { k: 548n, v: true }]), 550n, true)
  // setOrAddKeyValuePairsToDictionary :: dict<int, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 553n, v: new configId(554n) }, { k: 555n, v: new configId(556n) }]), 557n, new configId(558n))
  // setOrAddKeyValuePairsToDictionary :: dict<int, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 560n, v: f.getSelfEntity() }, { k: 562n, v: f.getSelfEntity() }]), 564n, f.getSelfEntity())
  // setOrAddKeyValuePairsToDictionary :: dict<int, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 567n, v: new faction(568n) }, { k: 569n, v: new faction(570n) }]), 571n, new faction(572n))
  // setOrAddKeyValuePairsToDictionary :: dict<int, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 574n, v: 575.25 }, { k: 576n, v: 577.25 }]), 578n, 579.25)
  // setOrAddKeyValuePairsToDictionary :: dict<int, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 581n, v: new guid(582n) }, { k: 583n, v: new guid(584n) }]), 585n, new guid(586n))
  // setOrAddKeyValuePairsToDictionary :: dict<int, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 588n, v: 589n }, { k: 590n, v: 591n }]), 592n, 593n)
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 595n, v: f.assemblyList([false, true, false], "bool") }, { k: 597n, v: f.assemblyList([false, true, false], "bool") }]), 599n, f.assemblyList([false, true, false], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 602n, v: f.assemblyList([603n, 604n, 605n], "config_id") }, { k: 604n, v: f.assemblyList([605n, 606n, 607n], "config_id") }]), 606n, f.assemblyList([607n, 608n, 609n], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 609n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: 612n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), 615n, f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 619n, v: f.assemblyList([620n, 621n, 622n], "faction") }, { k: 621n, v: f.assemblyList([622n, 623n, 624n], "faction") }]), 623n, f.assemblyList([624n, 625n, 626n], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 626n, v: f.assemblyList([627.25, 628.25, 629.25], "float") }, { k: 628n, v: f.assemblyList([629.25, 630.25, 631.25], "float") }]), 630n, f.assemblyList([631.25, 632.25, 633.25], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 633n, v: f.assemblyList([634n, 635n, 636n], "guid") }, { k: 635n, v: f.assemblyList([636n, 637n, 638n], "guid") }]), 637n, f.assemblyList([638n, 639n, 640n], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 640n, v: f.assemblyList([641n, 642n, 643n], "int") }, { k: 642n, v: f.assemblyList([643n, 644n, 645n], "int") }]), 644n, f.assemblyList([645n, 646n, 647n], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 647n, v: f.assemblyList(["648", "649", "650"], "str") }, { k: 649n, v: f.assemblyList(["650", "651", "652"], "str") }]), 651n, f.assemblyList(["652", "653", "654"], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 654n, v: f.assemblyList([[655, 656, 657], [656, 657, 658], [657, 658, 659]], "vec3") }, { k: 656n, v: f.assemblyList([[657, 658, 659], [658, 659, 660], [659, 660, 661]], "vec3") }]), 658n, f.assemblyList([[659, 660, 661], [660, 661, 662], [661, 662, 663]], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<int, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 661n, v: new prefabId(662n) }, { k: 663n, v: new prefabId(664n) }]), 665n, new prefabId(666n))
  // setOrAddKeyValuePairsToDictionary :: dict<int, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 668n, v: "669" }, { k: 670n, v: "671" }]), 672n, "673")
  // setOrAddKeyValuePairsToDictionary :: dict<int, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: 675n, v: f.create3dVector(676, 677, 678) }, { k: 677n, v: f.create3dVector(678, 679, 680) }]), 679n, f.create3dVector(680, 681, 682))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(682n), v: true }, { k: new prefabId(684n), v: true }]), new prefabId(686n), true)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(689n), v: new configId(690n) }, { k: new prefabId(691n), v: new configId(692n) }]), new prefabId(693n), new configId(694n))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(696n), v: f.getSelfEntity() }, { k: new prefabId(698n), v: f.getSelfEntity() }]), new prefabId(700n), f.getSelfEntity())
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(703n), v: new faction(704n) }, { k: new prefabId(705n), v: new faction(706n) }]), new prefabId(707n), new faction(708n))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(710n), v: 711.25 }, { k: new prefabId(712n), v: 713.25 }]), new prefabId(714n), 715.25)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(717n), v: new guid(718n) }, { k: new prefabId(719n), v: new guid(720n) }]), new prefabId(721n), new guid(722n))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(724n), v: 725n }, { k: new prefabId(726n), v: 727n }]), new prefabId(728n), 729n)
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(731n), v: f.assemblyList([false, true, false], "bool") }, { k: new prefabId(733n), v: f.assemblyList([false, true, false], "bool") }]), new prefabId(735n), f.assemblyList([false, true, false], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(738n), v: f.assemblyList([739n, 740n, 741n], "config_id") }, { k: new prefabId(740n), v: f.assemblyList([741n, 742n, 743n], "config_id") }]), new prefabId(742n), f.assemblyList([743n, 744n, 745n], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(745n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new prefabId(748n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new prefabId(751n), f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(755n), v: f.assemblyList([756n, 757n, 758n], "faction") }, { k: new prefabId(757n), v: f.assemblyList([758n, 759n, 760n], "faction") }]), new prefabId(759n), f.assemblyList([760n, 761n, 762n], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(762n), v: f.assemblyList([763.25, 764.25, 765.25], "float") }, { k: new prefabId(764n), v: f.assemblyList([765.25, 766.25, 767.25], "float") }]), new prefabId(766n), f.assemblyList([767.25, 768.25, 769.25], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(769n), v: f.assemblyList([770n, 771n, 772n], "guid") }, { k: new prefabId(771n), v: f.assemblyList([772n, 773n, 774n], "guid") }]), new prefabId(773n), f.assemblyList([774n, 775n, 776n], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(776n), v: f.assemblyList([777n, 778n, 779n], "int") }, { k: new prefabId(778n), v: f.assemblyList([779n, 780n, 781n], "int") }]), new prefabId(780n), f.assemblyList([781n, 782n, 783n], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(783n), v: f.assemblyList(["784", "785", "786"], "str") }, { k: new prefabId(785n), v: f.assemblyList(["786", "787", "788"], "str") }]), new prefabId(787n), f.assemblyList(["788", "789", "790"], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(790n), v: f.assemblyList([[791, 792, 793], [792, 793, 794], [793, 794, 795]], "vec3") }, { k: new prefabId(792n), v: f.assemblyList([[793, 794, 795], [794, 795, 796], [795, 796, 797]], "vec3") }]), new prefabId(794n), f.assemblyList([[795, 796, 797], [796, 797, 798], [797, 798, 799]], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(797n), v: new prefabId(798n) }, { k: new prefabId(799n), v: new prefabId(800n) }]), new prefabId(801n), new prefabId(802n))
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(804n), v: "805" }, { k: new prefabId(806n), v: "807" }]), new prefabId(808n), "809")
  // setOrAddKeyValuePairsToDictionary :: dict<prefabId, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: new prefabId(811n), v: f.create3dVector(812, 813, 814) }, { k: new prefabId(813n), v: f.create3dVector(814, 815, 816) }]), new prefabId(815n), f.create3dVector(816, 817, 818))
  // setOrAddKeyValuePairsToDictionary :: dict<str, bool>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "818", v: true }, { k: "820", v: true }]), "822", true)
  // setOrAddKeyValuePairsToDictionary :: dict<str, configId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "825", v: new configId(826n) }, { k: "827", v: new configId(828n) }]), "829", new configId(830n))
  // setOrAddKeyValuePairsToDictionary :: dict<str, entity>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "832", v: f.getSelfEntity() }, { k: "834", v: f.getSelfEntity() }]), "836", f.getSelfEntity())
  // setOrAddKeyValuePairsToDictionary :: dict<str, faction>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "839", v: new faction(840n) }, { k: "841", v: new faction(842n) }]), "843", new faction(844n))
  // setOrAddKeyValuePairsToDictionary :: dict<str, float>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "846", v: 847.25 }, { k: "848", v: 849.25 }]), "850", 851.25)
  // setOrAddKeyValuePairsToDictionary :: dict<str, guid>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "853", v: new guid(854n) }, { k: "855", v: new guid(856n) }]), "857", new guid(858n))
  // setOrAddKeyValuePairsToDictionary :: dict<str, int>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "860", v: 861n }, { k: "862", v: 863n }]), "864", 865n)
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<bool>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "867", v: f.assemblyList([false, true, false], "bool") }, { k: "869", v: f.assemblyList([false, true, false], "bool") }]), "871", f.assemblyList([false, true, false], "bool"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<configId>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "874", v: f.assemblyList([875n, 876n, 877n], "config_id") }, { k: "876", v: f.assemblyList([877n, 878n, 879n], "config_id") }]), "878", f.assemblyList([879n, 880n, 881n], "config_id"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<entity>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "881", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: "884", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), "887", f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<faction>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "891", v: f.assemblyList([892n, 893n, 894n], "faction") }, { k: "893", v: f.assemblyList([894n, 895n, 896n], "faction") }]), "895", f.assemblyList([896n, 897n, 898n], "faction"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<float>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "898", v: f.assemblyList([899.25, 900.25, 901.25], "float") }, { k: "900", v: f.assemblyList([901.25, 902.25, 903.25], "float") }]), "902", f.assemblyList([903.25, 904.25, 905.25], "float"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<guid>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "905", v: f.assemblyList([906n, 907n, 908n], "guid") }, { k: "907", v: f.assemblyList([908n, 909n, 910n], "guid") }]), "909", f.assemblyList([910n, 911n, 912n], "guid"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<int>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "912", v: f.assemblyList([913n, 914n, 915n], "int") }, { k: "914", v: f.assemblyList([915n, 916n, 917n], "int") }]), "916", f.assemblyList([917n, 918n, 919n], "int"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<str>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "919", v: f.assemblyList(["920", "921", "922"], "str") }, { k: "921", v: f.assemblyList(["922", "923", "924"], "str") }]), "923", f.assemblyList(["924", "925", "926"], "str"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, list<vec3>>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "926", v: f.assemblyList([[927, 928, 929], [928, 929, 930], [929, 930, 931]], "vec3") }, { k: "928", v: f.assemblyList([[929, 930, 931], [930, 931, 932], [931, 932, 933]], "vec3") }]), "930", f.assemblyList([[931, 932, 933], [932, 933, 934], [933, 934, 935]], "vec3"))
  // setOrAddKeyValuePairsToDictionary :: dict<str, prefabId>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "933", v: new prefabId(934n) }, { k: "935", v: new prefabId(936n) }]), "937", new prefabId(938n))
  // setOrAddKeyValuePairsToDictionary :: dict<str, str>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "940", v: "941" }, { k: "942", v: "943" }]), "944", "945")
  // setOrAddKeyValuePairsToDictionary :: dict<str, vec3>
  f.setOrAddKeyValuePairsToDictionary(f.assemblyDictionary([{ k: "947", v: f.create3dVector(948, 949, 950) }, { k: "949", v: f.create3dVector(950, 951, 952) }]), "951", f.create3dVector(952, 953, 954))
  // clearDictionary :: dict<configId, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]))
  // clearDictionary :: dict<configId, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(7n), v: new configId(8n) }, { k: new configId(9n), v: new configId(10n) }]))
  // clearDictionary :: dict<configId, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(12n), v: f.getSelfEntity() }, { k: new configId(14n), v: f.getSelfEntity() }]))
  // clearDictionary :: dict<configId, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(17n), v: new faction(18n) }, { k: new configId(19n), v: new faction(20n) }]))
  // clearDictionary :: dict<configId, float>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(22n), v: 23.25 }, { k: new configId(24n), v: 25.25 }]))
  // clearDictionary :: dict<configId, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(27n), v: new guid(28n) }, { k: new configId(29n), v: new guid(30n) }]))
  // clearDictionary :: dict<configId, int>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(32n), v: 33n }, { k: new configId(34n), v: 35n }]))
  // clearDictionary :: dict<configId, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(37n), v: f.assemblyList([false, true, false], "bool") }, { k: new configId(39n), v: f.assemblyList([false, true, false], "bool") }]))
  // clearDictionary :: dict<configId, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(42n), v: f.assemblyList([43n, 44n, 45n], "config_id") }, { k: new configId(44n), v: f.assemblyList([45n, 46n, 47n], "config_id") }]))
  // clearDictionary :: dict<configId, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(47n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new configId(50n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // clearDictionary :: dict<configId, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(54n), v: f.assemblyList([55n, 56n, 57n], "faction") }, { k: new configId(56n), v: f.assemblyList([57n, 58n, 59n], "faction") }]))
  // clearDictionary :: dict<configId, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(59n), v: f.assemblyList([60.25, 61.25, 62.25], "float") }, { k: new configId(61n), v: f.assemblyList([62.25, 63.25, 64.25], "float") }]))
  // clearDictionary :: dict<configId, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(64n), v: f.assemblyList([65n, 66n, 67n], "guid") }, { k: new configId(66n), v: f.assemblyList([67n, 68n, 69n], "guid") }]))
  // clearDictionary :: dict<configId, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(69n), v: f.assemblyList([70n, 71n, 72n], "int") }, { k: new configId(71n), v: f.assemblyList([72n, 73n, 74n], "int") }]))
  // clearDictionary :: dict<configId, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(74n), v: f.assemblyList(["75", "76", "77"], "str") }, { k: new configId(76n), v: f.assemblyList(["77", "78", "79"], "str") }]))
  // clearDictionary :: dict<configId, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(79n), v: f.assemblyList([[80, 81, 82], [81, 82, 83], [82, 83, 84]], "vec3") }, { k: new configId(81n), v: f.assemblyList([[82, 83, 84], [83, 84, 85], [84, 85, 86]], "vec3") }]))
  // clearDictionary :: dict<configId, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(84n), v: new prefabId(85n) }, { k: new configId(86n), v: new prefabId(87n) }]))
  // clearDictionary :: dict<configId, str>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(89n), v: "90" }, { k: new configId(91n), v: "92" }]))
  // clearDictionary :: dict<configId, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: new configId(94n), v: f.create3dVector(95, 96, 97) }, { k: new configId(96n), v: f.create3dVector(97, 98, 99) }]))
  // clearDictionary :: dict<entity, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: false }, { k: f.getSelfEntity(), v: false }]))
  // clearDictionary :: dict<entity, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(105n) }, { k: f.getSelfEntity(), v: new configId(107n) }]))
  // clearDictionary :: dict<entity, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]))
  // clearDictionary :: dict<entity, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(115n) }, { k: f.getSelfEntity(), v: new faction(117n) }]))
  // clearDictionary :: dict<entity, float>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 120.25 }, { k: f.getSelfEntity(), v: 122.25 }]))
  // clearDictionary :: dict<entity, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(125n) }, { k: f.getSelfEntity(), v: new guid(127n) }]))
  // clearDictionary :: dict<entity, int>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 130n }, { k: f.getSelfEntity(), v: 132n }]))
  // clearDictionary :: dict<entity, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }, { k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }]))
  // clearDictionary :: dict<entity, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([140n, 141n, 142n], "config_id") }, { k: f.getSelfEntity(), v: f.assemblyList([142n, 143n, 144n], "config_id") }]))
  // clearDictionary :: dict<entity, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // clearDictionary :: dict<entity, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([152n, 153n, 154n], "faction") }, { k: f.getSelfEntity(), v: f.assemblyList([154n, 155n, 156n], "faction") }]))
  // clearDictionary :: dict<entity, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([157.25, 158.25, 159.25], "float") }, { k: f.getSelfEntity(), v: f.assemblyList([159.25, 160.25, 161.25], "float") }]))
  // clearDictionary :: dict<entity, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([162n, 163n, 164n], "guid") }, { k: f.getSelfEntity(), v: f.assemblyList([164n, 165n, 166n], "guid") }]))
  // clearDictionary :: dict<entity, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([167n, 168n, 169n], "int") }, { k: f.getSelfEntity(), v: f.assemblyList([169n, 170n, 171n], "int") }]))
  // clearDictionary :: dict<entity, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList(["172", "173", "174"], "str") }, { k: f.getSelfEntity(), v: f.assemblyList(["174", "175", "176"], "str") }]))
  // clearDictionary :: dict<entity, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([[177, 178, 179], [178, 179, 180], [179, 180, 181]], "vec3") }, { k: f.getSelfEntity(), v: f.assemblyList([[179, 180, 181], [180, 181, 182], [181, 182, 183]], "vec3") }]))
  // clearDictionary :: dict<entity, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(182n) }, { k: f.getSelfEntity(), v: new prefabId(184n) }]))
  // clearDictionary :: dict<entity, str>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "187" }, { k: f.getSelfEntity(), v: "189" }]))
  // clearDictionary :: dict<entity, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(192, 193, 194) }, { k: f.getSelfEntity(), v: f.create3dVector(194, 195, 196) }]))
  // clearDictionary :: dict<faction, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(196n), v: true }, { k: new faction(198n), v: true }]))
  // clearDictionary :: dict<faction, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(201n), v: new configId(202n) }, { k: new faction(203n), v: new configId(204n) }]))
  // clearDictionary :: dict<faction, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(206n), v: f.getSelfEntity() }, { k: new faction(208n), v: f.getSelfEntity() }]))
  // clearDictionary :: dict<faction, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(211n), v: new faction(212n) }, { k: new faction(213n), v: new faction(214n) }]))
  // clearDictionary :: dict<faction, float>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(216n), v: 217.25 }, { k: new faction(218n), v: 219.25 }]))
  // clearDictionary :: dict<faction, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(221n), v: new guid(222n) }, { k: new faction(223n), v: new guid(224n) }]))
  // clearDictionary :: dict<faction, int>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(226n), v: 227n }, { k: new faction(228n), v: 229n }]))
  // clearDictionary :: dict<faction, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(231n), v: f.assemblyList([false, true, false], "bool") }, { k: new faction(233n), v: f.assemblyList([false, true, false], "bool") }]))
  // clearDictionary :: dict<faction, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(236n), v: f.assemblyList([237n, 238n, 239n], "config_id") }, { k: new faction(238n), v: f.assemblyList([239n, 240n, 241n], "config_id") }]))
  // clearDictionary :: dict<faction, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(241n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new faction(244n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // clearDictionary :: dict<faction, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(248n), v: f.assemblyList([249n, 250n, 251n], "faction") }, { k: new faction(250n), v: f.assemblyList([251n, 252n, 253n], "faction") }]))
  // clearDictionary :: dict<faction, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(253n), v: f.assemblyList([254.25, 255.25, 256.25], "float") }, { k: new faction(255n), v: f.assemblyList([256.25, 257.25, 258.25], "float") }]))
  // clearDictionary :: dict<faction, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(258n), v: f.assemblyList([259n, 260n, 261n], "guid") }, { k: new faction(260n), v: f.assemblyList([261n, 262n, 263n], "guid") }]))
  // clearDictionary :: dict<faction, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(263n), v: f.assemblyList([264n, 265n, 266n], "int") }, { k: new faction(265n), v: f.assemblyList([266n, 267n, 268n], "int") }]))
  // clearDictionary :: dict<faction, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(268n), v: f.assemblyList(["269", "270", "271"], "str") }, { k: new faction(270n), v: f.assemblyList(["271", "272", "273"], "str") }]))
  // clearDictionary :: dict<faction, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(273n), v: f.assemblyList([[274, 275, 276], [275, 276, 277], [276, 277, 278]], "vec3") }, { k: new faction(275n), v: f.assemblyList([[276, 277, 278], [277, 278, 279], [278, 279, 280]], "vec3") }]))
  // clearDictionary :: dict<faction, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(278n), v: new prefabId(279n) }, { k: new faction(280n), v: new prefabId(281n) }]))
  // clearDictionary :: dict<faction, str>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(283n), v: "284" }, { k: new faction(285n), v: "286" }]))
  // clearDictionary :: dict<faction, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: new faction(288n), v: f.create3dVector(289, 290, 291) }, { k: new faction(290n), v: f.create3dVector(291, 292, 293) }]))
  // clearDictionary :: dict<guid, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(293n), v: false }, { k: new guid(295n), v: false }]))
  // clearDictionary :: dict<guid, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(298n), v: new configId(299n) }, { k: new guid(300n), v: new configId(301n) }]))
  // clearDictionary :: dict<guid, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(303n), v: f.getSelfEntity() }, { k: new guid(305n), v: f.getSelfEntity() }]))
  // clearDictionary :: dict<guid, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(308n), v: new faction(309n) }, { k: new guid(310n), v: new faction(311n) }]))
  // clearDictionary :: dict<guid, float>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(313n), v: 314.25 }, { k: new guid(315n), v: 316.25 }]))
  // clearDictionary :: dict<guid, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(318n), v: new guid(319n) }, { k: new guid(320n), v: new guid(321n) }]))
  // clearDictionary :: dict<guid, int>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(323n), v: 324n }, { k: new guid(325n), v: 326n }]))
  // clearDictionary :: dict<guid, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(328n), v: f.assemblyList([true, false, true], "bool") }, { k: new guid(330n), v: f.assemblyList([true, false, true], "bool") }]))
  // clearDictionary :: dict<guid, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(333n), v: f.assemblyList([334n, 335n, 336n], "config_id") }, { k: new guid(335n), v: f.assemblyList([336n, 337n, 338n], "config_id") }]))
  // clearDictionary :: dict<guid, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(338n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new guid(341n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // clearDictionary :: dict<guid, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(345n), v: f.assemblyList([346n, 347n, 348n], "faction") }, { k: new guid(347n), v: f.assemblyList([348n, 349n, 350n], "faction") }]))
  // clearDictionary :: dict<guid, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(350n), v: f.assemblyList([351.25, 352.25, 353.25], "float") }, { k: new guid(352n), v: f.assemblyList([353.25, 354.25, 355.25], "float") }]))
  // clearDictionary :: dict<guid, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(355n), v: f.assemblyList([356n, 357n, 358n], "guid") }, { k: new guid(357n), v: f.assemblyList([358n, 359n, 360n], "guid") }]))
  // clearDictionary :: dict<guid, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(360n), v: f.assemblyList([361n, 362n, 363n], "int") }, { k: new guid(362n), v: f.assemblyList([363n, 364n, 365n], "int") }]))
  // clearDictionary :: dict<guid, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(365n), v: f.assemblyList(["366", "367", "368"], "str") }, { k: new guid(367n), v: f.assemblyList(["368", "369", "370"], "str") }]))
  // clearDictionary :: dict<guid, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(370n), v: f.assemblyList([[371, 372, 373], [372, 373, 374], [373, 374, 375]], "vec3") }, { k: new guid(372n), v: f.assemblyList([[373, 374, 375], [374, 375, 376], [375, 376, 377]], "vec3") }]))
  // clearDictionary :: dict<guid, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(375n), v: new prefabId(376n) }, { k: new guid(377n), v: new prefabId(378n) }]))
  // clearDictionary :: dict<guid, str>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(380n), v: "381" }, { k: new guid(382n), v: "383" }]))
  // clearDictionary :: dict<guid, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: new guid(385n), v: f.create3dVector(386, 387, 388) }, { k: new guid(387n), v: f.create3dVector(388, 389, 390) }]))
  // clearDictionary :: dict<int, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: 390n, v: true }, { k: 392n, v: true }]))
  // clearDictionary :: dict<int, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: 395n, v: new configId(396n) }, { k: 397n, v: new configId(398n) }]))
  // clearDictionary :: dict<int, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: 400n, v: f.getSelfEntity() }, { k: 402n, v: f.getSelfEntity() }]))
  // clearDictionary :: dict<int, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: 405n, v: new faction(406n) }, { k: 407n, v: new faction(408n) }]))
  // clearDictionary :: dict<int, float>
  f.clearDictionary(f.assemblyDictionary([{ k: 410n, v: 411.25 }, { k: 412n, v: 413.25 }]))
  // clearDictionary :: dict<int, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: 415n, v: new guid(416n) }, { k: 417n, v: new guid(418n) }]))
  // clearDictionary :: dict<int, int>
  f.clearDictionary(f.assemblyDictionary([{ k: 420n, v: 421n }, { k: 422n, v: 423n }]))
  // clearDictionary :: dict<int, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: 425n, v: f.assemblyList([false, true, false], "bool") }, { k: 427n, v: f.assemblyList([false, true, false], "bool") }]))
  // clearDictionary :: dict<int, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: 430n, v: f.assemblyList([431n, 432n, 433n], "config_id") }, { k: 432n, v: f.assemblyList([433n, 434n, 435n], "config_id") }]))
  // clearDictionary :: dict<int, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: 435n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: 438n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // clearDictionary :: dict<int, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: 442n, v: f.assemblyList([443n, 444n, 445n], "faction") }, { k: 444n, v: f.assemblyList([445n, 446n, 447n], "faction") }]))
  // clearDictionary :: dict<int, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: 447n, v: f.assemblyList([448.25, 449.25, 450.25], "float") }, { k: 449n, v: f.assemblyList([450.25, 451.25, 452.25], "float") }]))
  // clearDictionary :: dict<int, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: 452n, v: f.assemblyList([453n, 454n, 455n], "guid") }, { k: 454n, v: f.assemblyList([455n, 456n, 457n], "guid") }]))
  // clearDictionary :: dict<int, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: 457n, v: f.assemblyList([458n, 459n, 460n], "int") }, { k: 459n, v: f.assemblyList([460n, 461n, 462n], "int") }]))
  // clearDictionary :: dict<int, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: 462n, v: f.assemblyList(["463", "464", "465"], "str") }, { k: 464n, v: f.assemblyList(["465", "466", "467"], "str") }]))
  // clearDictionary :: dict<int, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: 467n, v: f.assemblyList([[468, 469, 470], [469, 470, 471], [470, 471, 472]], "vec3") }, { k: 469n, v: f.assemblyList([[470, 471, 472], [471, 472, 473], [472, 473, 474]], "vec3") }]))
  // clearDictionary :: dict<int, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: 472n, v: new prefabId(473n) }, { k: 474n, v: new prefabId(475n) }]))
  // clearDictionary :: dict<int, str>
  f.clearDictionary(f.assemblyDictionary([{ k: 477n, v: "478" }, { k: 479n, v: "480" }]))
  // clearDictionary :: dict<int, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: 482n, v: f.create3dVector(483, 484, 485) }, { k: 484n, v: f.create3dVector(485, 486, 487) }]))
  // clearDictionary :: dict<prefabId, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(487n), v: false }, { k: new prefabId(489n), v: false }]))
  // clearDictionary :: dict<prefabId, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(492n), v: new configId(493n) }, { k: new prefabId(494n), v: new configId(495n) }]))
  // clearDictionary :: dict<prefabId, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(497n), v: f.getSelfEntity() }, { k: new prefabId(499n), v: f.getSelfEntity() }]))
  // clearDictionary :: dict<prefabId, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(502n), v: new faction(503n) }, { k: new prefabId(504n), v: new faction(505n) }]))
  // clearDictionary :: dict<prefabId, float>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(507n), v: 508.25 }, { k: new prefabId(509n), v: 510.25 }]))
  // clearDictionary :: dict<prefabId, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(512n), v: new guid(513n) }, { k: new prefabId(514n), v: new guid(515n) }]))
  // clearDictionary :: dict<prefabId, int>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(517n), v: 518n }, { k: new prefabId(519n), v: 520n }]))
  // clearDictionary :: dict<prefabId, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(522n), v: f.assemblyList([true, false, true], "bool") }, { k: new prefabId(524n), v: f.assemblyList([true, false, true], "bool") }]))
  // clearDictionary :: dict<prefabId, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(527n), v: f.assemblyList([528n, 529n, 530n], "config_id") }, { k: new prefabId(529n), v: f.assemblyList([530n, 531n, 532n], "config_id") }]))
  // clearDictionary :: dict<prefabId, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(532n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new prefabId(535n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // clearDictionary :: dict<prefabId, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(539n), v: f.assemblyList([540n, 541n, 542n], "faction") }, { k: new prefabId(541n), v: f.assemblyList([542n, 543n, 544n], "faction") }]))
  // clearDictionary :: dict<prefabId, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(544n), v: f.assemblyList([545.25, 546.25, 547.25], "float") }, { k: new prefabId(546n), v: f.assemblyList([547.25, 548.25, 549.25], "float") }]))
  // clearDictionary :: dict<prefabId, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(549n), v: f.assemblyList([550n, 551n, 552n], "guid") }, { k: new prefabId(551n), v: f.assemblyList([552n, 553n, 554n], "guid") }]))
  // clearDictionary :: dict<prefabId, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(554n), v: f.assemblyList([555n, 556n, 557n], "int") }, { k: new prefabId(556n), v: f.assemblyList([557n, 558n, 559n], "int") }]))
  // clearDictionary :: dict<prefabId, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(559n), v: f.assemblyList(["560", "561", "562"], "str") }, { k: new prefabId(561n), v: f.assemblyList(["562", "563", "564"], "str") }]))
  // clearDictionary :: dict<prefabId, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(564n), v: f.assemblyList([[565, 566, 567], [566, 567, 568], [567, 568, 569]], "vec3") }, { k: new prefabId(566n), v: f.assemblyList([[567, 568, 569], [568, 569, 570], [569, 570, 571]], "vec3") }]))
  // clearDictionary :: dict<prefabId, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(569n), v: new prefabId(570n) }, { k: new prefabId(571n), v: new prefabId(572n) }]))
  // clearDictionary :: dict<prefabId, str>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(574n), v: "575" }, { k: new prefabId(576n), v: "577" }]))
  // clearDictionary :: dict<prefabId, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: new prefabId(579n), v: f.create3dVector(580, 581, 582) }, { k: new prefabId(581n), v: f.create3dVector(582, 583, 584) }]))
  // clearDictionary :: dict<str, bool>
  f.clearDictionary(f.assemblyDictionary([{ k: "584", v: true }, { k: "586", v: true }]))
  // clearDictionary :: dict<str, configId>
  f.clearDictionary(f.assemblyDictionary([{ k: "589", v: new configId(590n) }, { k: "591", v: new configId(592n) }]))
  // clearDictionary :: dict<str, entity>
  f.clearDictionary(f.assemblyDictionary([{ k: "594", v: f.getSelfEntity() }, { k: "596", v: f.getSelfEntity() }]))
  // clearDictionary :: dict<str, faction>
  f.clearDictionary(f.assemblyDictionary([{ k: "599", v: new faction(600n) }, { k: "601", v: new faction(602n) }]))
  // clearDictionary :: dict<str, float>
  f.clearDictionary(f.assemblyDictionary([{ k: "604", v: 605.25 }, { k: "606", v: 607.25 }]))
  // clearDictionary :: dict<str, guid>
  f.clearDictionary(f.assemblyDictionary([{ k: "609", v: new guid(610n) }, { k: "611", v: new guid(612n) }]))
  // clearDictionary :: dict<str, int>
  f.clearDictionary(f.assemblyDictionary([{ k: "614", v: 615n }, { k: "616", v: 617n }]))
  // clearDictionary :: dict<str, list<bool>>
  f.clearDictionary(f.assemblyDictionary([{ k: "619", v: f.assemblyList([false, true, false], "bool") }, { k: "621", v: f.assemblyList([false, true, false], "bool") }]))
  // clearDictionary :: dict<str, list<configId>>
  f.clearDictionary(f.assemblyDictionary([{ k: "624", v: f.assemblyList([625n, 626n, 627n], "config_id") }, { k: "626", v: f.assemblyList([627n, 628n, 629n], "config_id") }]))
  // clearDictionary :: dict<str, list<entity>>
  f.clearDictionary(f.assemblyDictionary([{ k: "629", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: "632", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // clearDictionary :: dict<str, list<faction>>
  f.clearDictionary(f.assemblyDictionary([{ k: "636", v: f.assemblyList([637n, 638n, 639n], "faction") }, { k: "638", v: f.assemblyList([639n, 640n, 641n], "faction") }]))
  // clearDictionary :: dict<str, list<float>>
  f.clearDictionary(f.assemblyDictionary([{ k: "641", v: f.assemblyList([642.25, 643.25, 644.25], "float") }, { k: "643", v: f.assemblyList([644.25, 645.25, 646.25], "float") }]))
  // clearDictionary :: dict<str, list<guid>>
  f.clearDictionary(f.assemblyDictionary([{ k: "646", v: f.assemblyList([647n, 648n, 649n], "guid") }, { k: "648", v: f.assemblyList([649n, 650n, 651n], "guid") }]))
  // clearDictionary :: dict<str, list<int>>
  f.clearDictionary(f.assemblyDictionary([{ k: "651", v: f.assemblyList([652n, 653n, 654n], "int") }, { k: "653", v: f.assemblyList([654n, 655n, 656n], "int") }]))
  // clearDictionary :: dict<str, list<str>>
  f.clearDictionary(f.assemblyDictionary([{ k: "656", v: f.assemblyList(["657", "658", "659"], "str") }, { k: "658", v: f.assemblyList(["659", "660", "661"], "str") }]))
  // clearDictionary :: dict<str, list<vec3>>
  f.clearDictionary(f.assemblyDictionary([{ k: "661", v: f.assemblyList([[662, 663, 664], [663, 664, 665], [664, 665, 666]], "vec3") }, { k: "663", v: f.assemblyList([[664, 665, 666], [665, 666, 667], [666, 667, 668]], "vec3") }]))
  // clearDictionary :: dict<str, prefabId>
  f.clearDictionary(f.assemblyDictionary([{ k: "666", v: new prefabId(667n) }, { k: "668", v: new prefabId(669n) }]))
  // clearDictionary :: dict<str, str>
  f.clearDictionary(f.assemblyDictionary([{ k: "671", v: "672" }, { k: "673", v: "674" }]))
  // clearDictionary :: dict<str, vec3>
  f.clearDictionary(f.assemblyDictionary([{ k: "676", v: f.create3dVector(677, 678, 679) }, { k: "678", v: f.create3dVector(679, 680, 681) }]))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]), new configId(6n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(8n), v: new configId(9n) }, { k: new configId(10n), v: new configId(11n) }]), new configId(12n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(14n), v: f.getSelfEntity() }, { k: new configId(16n), v: f.getSelfEntity() }]), new configId(18n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(20n), v: new faction(21n) }, { k: new configId(22n), v: new faction(23n) }]), new configId(24n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(26n), v: 27.25 }, { k: new configId(28n), v: 29.25 }]), new configId(30n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(32n), v: new guid(33n) }, { k: new configId(34n), v: new guid(35n) }]), new configId(36n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(38n), v: 39n }, { k: new configId(40n), v: 41n }]), new configId(42n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(44n), v: f.assemblyList([true, false, true], "bool") }, { k: new configId(46n), v: f.assemblyList([true, false, true], "bool") }]), new configId(48n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(50n), v: f.assemblyList([51n, 52n, 53n], "config_id") }, { k: new configId(52n), v: f.assemblyList([53n, 54n, 55n], "config_id") }]), new configId(54n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(56n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new configId(59n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new configId(62n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(64n), v: f.assemblyList([65n, 66n, 67n], "faction") }, { k: new configId(66n), v: f.assemblyList([67n, 68n, 69n], "faction") }]), new configId(68n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(70n), v: f.assemblyList([71.25, 72.25, 73.25], "float") }, { k: new configId(72n), v: f.assemblyList([73.25, 74.25, 75.25], "float") }]), new configId(74n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(76n), v: f.assemblyList([77n, 78n, 79n], "guid") }, { k: new configId(78n), v: f.assemblyList([79n, 80n, 81n], "guid") }]), new configId(80n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(82n), v: f.assemblyList([83n, 84n, 85n], "int") }, { k: new configId(84n), v: f.assemblyList([85n, 86n, 87n], "int") }]), new configId(86n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(88n), v: f.assemblyList(["89", "90", "91"], "str") }, { k: new configId(90n), v: f.assemblyList(["91", "92", "93"], "str") }]), new configId(92n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(94n), v: f.assemblyList([[95, 96, 97], [96, 97, 98], [97, 98, 99]], "vec3") }, { k: new configId(96n), v: f.assemblyList([[97, 98, 99], [98, 99, 100], [99, 100, 101]], "vec3") }]), new configId(98n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(100n), v: new prefabId(101n) }, { k: new configId(102n), v: new prefabId(103n) }]), new configId(104n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(106n), v: "107" }, { k: new configId(108n), v: "109" }]), new configId(110n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<configId, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new configId(112n), v: f.create3dVector(113, 114, 115) }, { k: new configId(114n), v: f.create3dVector(115, 116, 117) }]), new configId(116n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: true }, { k: f.getSelfEntity(), v: true }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(125n) }, { k: f.getSelfEntity(), v: new configId(127n) }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(137n) }, { k: f.getSelfEntity(), v: new faction(139n) }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 143.25 }, { k: f.getSelfEntity(), v: 145.25 }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(149n) }, { k: f.getSelfEntity(), v: new guid(151n) }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 155n }, { k: f.getSelfEntity(), v: 157n }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }, { k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([167n, 168n, 169n], "config_id") }, { k: f.getSelfEntity(), v: f.assemblyList([169n, 170n, 171n], "config_id") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([181n, 182n, 183n], "faction") }, { k: f.getSelfEntity(), v: f.assemblyList([183n, 184n, 185n], "faction") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([187.25, 188.25, 189.25], "float") }, { k: f.getSelfEntity(), v: f.assemblyList([189.25, 190.25, 191.25], "float") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([193n, 194n, 195n], "guid") }, { k: f.getSelfEntity(), v: f.assemblyList([195n, 196n, 197n], "guid") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([199n, 200n, 201n], "int") }, { k: f.getSelfEntity(), v: f.assemblyList([201n, 202n, 203n], "int") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList(["205", "206", "207"], "str") }, { k: f.getSelfEntity(), v: f.assemblyList(["207", "208", "209"], "str") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([[211, 212, 213], [212, 213, 214], [213, 214, 215]], "vec3") }, { k: f.getSelfEntity(), v: f.assemblyList([[213, 214, 215], [214, 215, 216], [215, 216, 217]], "vec3") }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(217n) }, { k: f.getSelfEntity(), v: new prefabId(219n) }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "223" }, { k: f.getSelfEntity(), v: "225" }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<entity, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(229, 230, 231) }, { k: f.getSelfEntity(), v: f.create3dVector(231, 232, 233) }]), f.getSelfEntity())
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(234n), v: true }, { k: new faction(236n), v: true }]), new faction(238n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(240n), v: new configId(241n) }, { k: new faction(242n), v: new configId(243n) }]), new faction(244n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(246n), v: f.getSelfEntity() }, { k: new faction(248n), v: f.getSelfEntity() }]), new faction(250n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(252n), v: new faction(253n) }, { k: new faction(254n), v: new faction(255n) }]), new faction(256n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(258n), v: 259.25 }, { k: new faction(260n), v: 261.25 }]), new faction(262n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(264n), v: new guid(265n) }, { k: new faction(266n), v: new guid(267n) }]), new faction(268n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(270n), v: 271n }, { k: new faction(272n), v: 273n }]), new faction(274n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(276n), v: f.assemblyList([true, false, true], "bool") }, { k: new faction(278n), v: f.assemblyList([true, false, true], "bool") }]), new faction(280n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(282n), v: f.assemblyList([283n, 284n, 285n], "config_id") }, { k: new faction(284n), v: f.assemblyList([285n, 286n, 287n], "config_id") }]), new faction(286n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(288n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new faction(291n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new faction(294n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(296n), v: f.assemblyList([297n, 298n, 299n], "faction") }, { k: new faction(298n), v: f.assemblyList([299n, 300n, 301n], "faction") }]), new faction(300n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(302n), v: f.assemblyList([303.25, 304.25, 305.25], "float") }, { k: new faction(304n), v: f.assemblyList([305.25, 306.25, 307.25], "float") }]), new faction(306n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(308n), v: f.assemblyList([309n, 310n, 311n], "guid") }, { k: new faction(310n), v: f.assemblyList([311n, 312n, 313n], "guid") }]), new faction(312n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(314n), v: f.assemblyList([315n, 316n, 317n], "int") }, { k: new faction(316n), v: f.assemblyList([317n, 318n, 319n], "int") }]), new faction(318n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(320n), v: f.assemblyList(["321", "322", "323"], "str") }, { k: new faction(322n), v: f.assemblyList(["323", "324", "325"], "str") }]), new faction(324n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(326n), v: f.assemblyList([[327, 328, 329], [328, 329, 330], [329, 330, 331]], "vec3") }, { k: new faction(328n), v: f.assemblyList([[329, 330, 331], [330, 331, 332], [331, 332, 333]], "vec3") }]), new faction(330n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(332n), v: new prefabId(333n) }, { k: new faction(334n), v: new prefabId(335n) }]), new faction(336n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(338n), v: "339" }, { k: new faction(340n), v: "341" }]), new faction(342n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<faction, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new faction(344n), v: f.create3dVector(345, 346, 347) }, { k: new faction(346n), v: f.create3dVector(347, 348, 349) }]), new faction(348n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(350n), v: true }, { k: new guid(352n), v: true }]), new guid(354n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(356n), v: new configId(357n) }, { k: new guid(358n), v: new configId(359n) }]), new guid(360n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(362n), v: f.getSelfEntity() }, { k: new guid(364n), v: f.getSelfEntity() }]), new guid(366n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(368n), v: new faction(369n) }, { k: new guid(370n), v: new faction(371n) }]), new guid(372n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(374n), v: 375.25 }, { k: new guid(376n), v: 377.25 }]), new guid(378n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(380n), v: new guid(381n) }, { k: new guid(382n), v: new guid(383n) }]), new guid(384n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(386n), v: 387n }, { k: new guid(388n), v: 389n }]), new guid(390n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(392n), v: f.assemblyList([true, false, true], "bool") }, { k: new guid(394n), v: f.assemblyList([true, false, true], "bool") }]), new guid(396n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(398n), v: f.assemblyList([399n, 400n, 401n], "config_id") }, { k: new guid(400n), v: f.assemblyList([401n, 402n, 403n], "config_id") }]), new guid(402n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(404n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new guid(407n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new guid(410n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(412n), v: f.assemblyList([413n, 414n, 415n], "faction") }, { k: new guid(414n), v: f.assemblyList([415n, 416n, 417n], "faction") }]), new guid(416n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(418n), v: f.assemblyList([419.25, 420.25, 421.25], "float") }, { k: new guid(420n), v: f.assemblyList([421.25, 422.25, 423.25], "float") }]), new guid(422n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(424n), v: f.assemblyList([425n, 426n, 427n], "guid") }, { k: new guid(426n), v: f.assemblyList([427n, 428n, 429n], "guid") }]), new guid(428n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(430n), v: f.assemblyList([431n, 432n, 433n], "int") }, { k: new guid(432n), v: f.assemblyList([433n, 434n, 435n], "int") }]), new guid(434n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(436n), v: f.assemblyList(["437", "438", "439"], "str") }, { k: new guid(438n), v: f.assemblyList(["439", "440", "441"], "str") }]), new guid(440n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(442n), v: f.assemblyList([[443, 444, 445], [444, 445, 446], [445, 446, 447]], "vec3") }, { k: new guid(444n), v: f.assemblyList([[445, 446, 447], [446, 447, 448], [447, 448, 449]], "vec3") }]), new guid(446n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(448n), v: new prefabId(449n) }, { k: new guid(450n), v: new prefabId(451n) }]), new guid(452n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(454n), v: "455" }, { k: new guid(456n), v: "457" }]), new guid(458n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<guid, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new guid(460n), v: f.create3dVector(461, 462, 463) }, { k: new guid(462n), v: f.create3dVector(463, 464, 465) }]), new guid(464n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 466n, v: true }, { k: 468n, v: true }]), 470n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 472n, v: new configId(473n) }, { k: 474n, v: new configId(475n) }]), 476n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 478n, v: f.getSelfEntity() }, { k: 480n, v: f.getSelfEntity() }]), 482n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 484n, v: new faction(485n) }, { k: 486n, v: new faction(487n) }]), 488n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 490n, v: 491.25 }, { k: 492n, v: 493.25 }]), 494n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 496n, v: new guid(497n) }, { k: 498n, v: new guid(499n) }]), 500n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 502n, v: 503n }, { k: 504n, v: 505n }]), 506n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 508n, v: f.assemblyList([true, false, true], "bool") }, { k: 510n, v: f.assemblyList([true, false, true], "bool") }]), 512n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 514n, v: f.assemblyList([515n, 516n, 517n], "config_id") }, { k: 516n, v: f.assemblyList([517n, 518n, 519n], "config_id") }]), 518n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 520n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: 523n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), 526n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 528n, v: f.assemblyList([529n, 530n, 531n], "faction") }, { k: 530n, v: f.assemblyList([531n, 532n, 533n], "faction") }]), 532n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 534n, v: f.assemblyList([535.25, 536.25, 537.25], "float") }, { k: 536n, v: f.assemblyList([537.25, 538.25, 539.25], "float") }]), 538n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 540n, v: f.assemblyList([541n, 542n, 543n], "guid") }, { k: 542n, v: f.assemblyList([543n, 544n, 545n], "guid") }]), 544n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 546n, v: f.assemblyList([547n, 548n, 549n], "int") }, { k: 548n, v: f.assemblyList([549n, 550n, 551n], "int") }]), 550n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 552n, v: f.assemblyList(["553", "554", "555"], "str") }, { k: 554n, v: f.assemblyList(["555", "556", "557"], "str") }]), 556n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 558n, v: f.assemblyList([[559, 560, 561], [560, 561, 562], [561, 562, 563]], "vec3") }, { k: 560n, v: f.assemblyList([[561, 562, 563], [562, 563, 564], [563, 564, 565]], "vec3") }]), 562n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 564n, v: new prefabId(565n) }, { k: 566n, v: new prefabId(567n) }]), 568n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 570n, v: "571" }, { k: 572n, v: "573" }]), 574n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<int, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: 576n, v: f.create3dVector(577, 578, 579) }, { k: 578n, v: f.create3dVector(579, 580, 581) }]), 580n)
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(582n), v: true }, { k: new prefabId(584n), v: true }]), new prefabId(586n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(588n), v: new configId(589n) }, { k: new prefabId(590n), v: new configId(591n) }]), new prefabId(592n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(594n), v: f.getSelfEntity() }, { k: new prefabId(596n), v: f.getSelfEntity() }]), new prefabId(598n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(600n), v: new faction(601n) }, { k: new prefabId(602n), v: new faction(603n) }]), new prefabId(604n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(606n), v: 607.25 }, { k: new prefabId(608n), v: 609.25 }]), new prefabId(610n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(612n), v: new guid(613n) }, { k: new prefabId(614n), v: new guid(615n) }]), new prefabId(616n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(618n), v: 619n }, { k: new prefabId(620n), v: 621n }]), new prefabId(622n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(624n), v: f.assemblyList([true, false, true], "bool") }, { k: new prefabId(626n), v: f.assemblyList([true, false, true], "bool") }]), new prefabId(628n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(630n), v: f.assemblyList([631n, 632n, 633n], "config_id") }, { k: new prefabId(632n), v: f.assemblyList([633n, 634n, 635n], "config_id") }]), new prefabId(634n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(636n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new prefabId(639n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new prefabId(642n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(644n), v: f.assemblyList([645n, 646n, 647n], "faction") }, { k: new prefabId(646n), v: f.assemblyList([647n, 648n, 649n], "faction") }]), new prefabId(648n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(650n), v: f.assemblyList([651.25, 652.25, 653.25], "float") }, { k: new prefabId(652n), v: f.assemblyList([653.25, 654.25, 655.25], "float") }]), new prefabId(654n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(656n), v: f.assemblyList([657n, 658n, 659n], "guid") }, { k: new prefabId(658n), v: f.assemblyList([659n, 660n, 661n], "guid") }]), new prefabId(660n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(662n), v: f.assemblyList([663n, 664n, 665n], "int") }, { k: new prefabId(664n), v: f.assemblyList([665n, 666n, 667n], "int") }]), new prefabId(666n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(668n), v: f.assemblyList(["669", "670", "671"], "str") }, { k: new prefabId(670n), v: f.assemblyList(["671", "672", "673"], "str") }]), new prefabId(672n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(674n), v: f.assemblyList([[675, 676, 677], [676, 677, 678], [677, 678, 679]], "vec3") }, { k: new prefabId(676n), v: f.assemblyList([[677, 678, 679], [678, 679, 680], [679, 680, 681]], "vec3") }]), new prefabId(678n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(680n), v: new prefabId(681n) }, { k: new prefabId(682n), v: new prefabId(683n) }]), new prefabId(684n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(686n), v: "687" }, { k: new prefabId(688n), v: "689" }]), new prefabId(690n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<prefabId, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: new prefabId(692n), v: f.create3dVector(693, 694, 695) }, { k: new prefabId(694n), v: f.create3dVector(695, 696, 697) }]), new prefabId(696n))
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, bool>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "698", v: true }, { k: "700", v: true }]), "702")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, configId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "704", v: new configId(705n) }, { k: "706", v: new configId(707n) }]), "708")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, entity>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "710", v: f.getSelfEntity() }, { k: "712", v: f.getSelfEntity() }]), "714")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, faction>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "716", v: new faction(717n) }, { k: "718", v: new faction(719n) }]), "720")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, float>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "722", v: 723.25 }, { k: "724", v: 725.25 }]), "726")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, guid>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "728", v: new guid(729n) }, { k: "730", v: new guid(731n) }]), "732")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, int>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "734", v: 735n }, { k: "736", v: 737n }]), "738")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<bool>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "740", v: f.assemblyList([true, false, true], "bool") }, { k: "742", v: f.assemblyList([true, false, true], "bool") }]), "744")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<configId>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "746", v: f.assemblyList([747n, 748n, 749n], "config_id") }, { k: "748", v: f.assemblyList([749n, 750n, 751n], "config_id") }]), "750")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<entity>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "752", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: "755", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), "758")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<faction>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "760", v: f.assemblyList([761n, 762n, 763n], "faction") }, { k: "762", v: f.assemblyList([763n, 764n, 765n], "faction") }]), "764")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<float>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "766", v: f.assemblyList([767.25, 768.25, 769.25], "float") }, { k: "768", v: f.assemblyList([769.25, 770.25, 771.25], "float") }]), "770")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<guid>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "772", v: f.assemblyList([773n, 774n, 775n], "guid") }, { k: "774", v: f.assemblyList([775n, 776n, 777n], "guid") }]), "776")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<int>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "778", v: f.assemblyList([779n, 780n, 781n], "int") }, { k: "780", v: f.assemblyList([781n, 782n, 783n], "int") }]), "782")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<str>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "784", v: f.assemblyList(["785", "786", "787"], "str") }, { k: "786", v: f.assemblyList(["787", "788", "789"], "str") }]), "788")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, list<vec3>>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "790", v: f.assemblyList([[791, 792, 793], [792, 793, 794], [793, 794, 795]], "vec3") }, { k: "792", v: f.assemblyList([[793, 794, 795], [794, 795, 796], [795, 796, 797]], "vec3") }]), "794")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, prefabId>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "796", v: new prefabId(797n) }, { k: "798", v: new prefabId(799n) }]), "800")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, str>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "802", v: "803" }, { k: "804", v: "805" }]), "806")
  // removeKeyValuePairsFromDictionaryByKey :: dict<str, vec3>
  f.removeKeyValuePairsFromDictionaryByKey(f.assemblyDictionary([{ k: "808", v: f.create3dVector(809, 810, 811) }, { k: "810", v: f.create3dVector(811, 812, 813) }]), "812")
  // queryIfDictionaryContainsSpecificKey :: dict<configId, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]), new configId(6n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(8n), v: new configId(9n) }, { k: new configId(10n), v: new configId(11n) }]), new configId(12n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(14n), v: f.getSelfEntity() }, { k: new configId(16n), v: f.getSelfEntity() }]), new configId(18n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(20n), v: new faction(21n) }, { k: new configId(22n), v: new faction(23n) }]), new configId(24n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(26n), v: 27.25 }, { k: new configId(28n), v: 29.25 }]), new configId(30n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(32n), v: new guid(33n) }, { k: new configId(34n), v: new guid(35n) }]), new configId(36n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(38n), v: 39n }, { k: new configId(40n), v: 41n }]), new configId(42n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(44n), v: f.assemblyList([true, false, true], "bool") }, { k: new configId(46n), v: f.assemblyList([true, false, true], "bool") }]), new configId(48n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(50n), v: f.assemblyList([51n, 52n, 53n], "config_id") }, { k: new configId(52n), v: f.assemblyList([53n, 54n, 55n], "config_id") }]), new configId(54n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(56n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new configId(59n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new configId(62n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(64n), v: f.assemblyList([65n, 66n, 67n], "faction") }, { k: new configId(66n), v: f.assemblyList([67n, 68n, 69n], "faction") }]), new configId(68n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(70n), v: f.assemblyList([71.25, 72.25, 73.25], "float") }, { k: new configId(72n), v: f.assemblyList([73.25, 74.25, 75.25], "float") }]), new configId(74n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(76n), v: f.assemblyList([77n, 78n, 79n], "guid") }, { k: new configId(78n), v: f.assemblyList([79n, 80n, 81n], "guid") }]), new configId(80n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(82n), v: f.assemblyList([83n, 84n, 85n], "int") }, { k: new configId(84n), v: f.assemblyList([85n, 86n, 87n], "int") }]), new configId(86n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(88n), v: f.assemblyList(["89", "90", "91"], "str") }, { k: new configId(90n), v: f.assemblyList(["91", "92", "93"], "str") }]), new configId(92n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(94n), v: f.assemblyList([[95, 96, 97], [96, 97, 98], [97, 98, 99]], "vec3") }, { k: new configId(96n), v: f.assemblyList([[97, 98, 99], [98, 99, 100], [99, 100, 101]], "vec3") }]), new configId(98n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(100n), v: new prefabId(101n) }, { k: new configId(102n), v: new prefabId(103n) }]), new configId(104n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(106n), v: "107" }, { k: new configId(108n), v: "109" }]), new configId(110n))
  // queryIfDictionaryContainsSpecificKey :: dict<configId, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new configId(112n), v: f.create3dVector(113, 114, 115) }, { k: new configId(114n), v: f.create3dVector(115, 116, 117) }]), new configId(116n))
  // queryIfDictionaryContainsSpecificKey :: dict<entity, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: true }, { k: f.getSelfEntity(), v: true }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(125n) }, { k: f.getSelfEntity(), v: new configId(127n) }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(137n) }, { k: f.getSelfEntity(), v: new faction(139n) }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 143.25 }, { k: f.getSelfEntity(), v: 145.25 }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(149n) }, { k: f.getSelfEntity(), v: new guid(151n) }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 155n }, { k: f.getSelfEntity(), v: 157n }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }, { k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([167n, 168n, 169n], "config_id") }, { k: f.getSelfEntity(), v: f.assemblyList([169n, 170n, 171n], "config_id") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([181n, 182n, 183n], "faction") }, { k: f.getSelfEntity(), v: f.assemblyList([183n, 184n, 185n], "faction") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([187.25, 188.25, 189.25], "float") }, { k: f.getSelfEntity(), v: f.assemblyList([189.25, 190.25, 191.25], "float") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([193n, 194n, 195n], "guid") }, { k: f.getSelfEntity(), v: f.assemblyList([195n, 196n, 197n], "guid") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([199n, 200n, 201n], "int") }, { k: f.getSelfEntity(), v: f.assemblyList([201n, 202n, 203n], "int") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList(["205", "206", "207"], "str") }, { k: f.getSelfEntity(), v: f.assemblyList(["207", "208", "209"], "str") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([[211, 212, 213], [212, 213, 214], [213, 214, 215]], "vec3") }, { k: f.getSelfEntity(), v: f.assemblyList([[213, 214, 215], [214, 215, 216], [215, 216, 217]], "vec3") }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(217n) }, { k: f.getSelfEntity(), v: new prefabId(219n) }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "223" }, { k: f.getSelfEntity(), v: "225" }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<entity, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(229, 230, 231) }, { k: f.getSelfEntity(), v: f.create3dVector(231, 232, 233) }]), f.getSelfEntity())
  // queryIfDictionaryContainsSpecificKey :: dict<faction, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(234n), v: true }, { k: new faction(236n), v: true }]), new faction(238n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(240n), v: new configId(241n) }, { k: new faction(242n), v: new configId(243n) }]), new faction(244n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(246n), v: f.getSelfEntity() }, { k: new faction(248n), v: f.getSelfEntity() }]), new faction(250n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(252n), v: new faction(253n) }, { k: new faction(254n), v: new faction(255n) }]), new faction(256n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(258n), v: 259.25 }, { k: new faction(260n), v: 261.25 }]), new faction(262n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(264n), v: new guid(265n) }, { k: new faction(266n), v: new guid(267n) }]), new faction(268n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(270n), v: 271n }, { k: new faction(272n), v: 273n }]), new faction(274n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(276n), v: f.assemblyList([true, false, true], "bool") }, { k: new faction(278n), v: f.assemblyList([true, false, true], "bool") }]), new faction(280n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(282n), v: f.assemblyList([283n, 284n, 285n], "config_id") }, { k: new faction(284n), v: f.assemblyList([285n, 286n, 287n], "config_id") }]), new faction(286n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(288n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new faction(291n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new faction(294n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(296n), v: f.assemblyList([297n, 298n, 299n], "faction") }, { k: new faction(298n), v: f.assemblyList([299n, 300n, 301n], "faction") }]), new faction(300n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(302n), v: f.assemblyList([303.25, 304.25, 305.25], "float") }, { k: new faction(304n), v: f.assemblyList([305.25, 306.25, 307.25], "float") }]), new faction(306n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(308n), v: f.assemblyList([309n, 310n, 311n], "guid") }, { k: new faction(310n), v: f.assemblyList([311n, 312n, 313n], "guid") }]), new faction(312n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(314n), v: f.assemblyList([315n, 316n, 317n], "int") }, { k: new faction(316n), v: f.assemblyList([317n, 318n, 319n], "int") }]), new faction(318n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(320n), v: f.assemblyList(["321", "322", "323"], "str") }, { k: new faction(322n), v: f.assemblyList(["323", "324", "325"], "str") }]), new faction(324n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(326n), v: f.assemblyList([[327, 328, 329], [328, 329, 330], [329, 330, 331]], "vec3") }, { k: new faction(328n), v: f.assemblyList([[329, 330, 331], [330, 331, 332], [331, 332, 333]], "vec3") }]), new faction(330n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(332n), v: new prefabId(333n) }, { k: new faction(334n), v: new prefabId(335n) }]), new faction(336n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(338n), v: "339" }, { k: new faction(340n), v: "341" }]), new faction(342n))
  // queryIfDictionaryContainsSpecificKey :: dict<faction, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new faction(344n), v: f.create3dVector(345, 346, 347) }, { k: new faction(346n), v: f.create3dVector(347, 348, 349) }]), new faction(348n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(350n), v: true }, { k: new guid(352n), v: true }]), new guid(354n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(356n), v: new configId(357n) }, { k: new guid(358n), v: new configId(359n) }]), new guid(360n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(362n), v: f.getSelfEntity() }, { k: new guid(364n), v: f.getSelfEntity() }]), new guid(366n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(368n), v: new faction(369n) }, { k: new guid(370n), v: new faction(371n) }]), new guid(372n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(374n), v: 375.25 }, { k: new guid(376n), v: 377.25 }]), new guid(378n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(380n), v: new guid(381n) }, { k: new guid(382n), v: new guid(383n) }]), new guid(384n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(386n), v: 387n }, { k: new guid(388n), v: 389n }]), new guid(390n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(392n), v: f.assemblyList([true, false, true], "bool") }, { k: new guid(394n), v: f.assemblyList([true, false, true], "bool") }]), new guid(396n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(398n), v: f.assemblyList([399n, 400n, 401n], "config_id") }, { k: new guid(400n), v: f.assemblyList([401n, 402n, 403n], "config_id") }]), new guid(402n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(404n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new guid(407n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new guid(410n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(412n), v: f.assemblyList([413n, 414n, 415n], "faction") }, { k: new guid(414n), v: f.assemblyList([415n, 416n, 417n], "faction") }]), new guid(416n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(418n), v: f.assemblyList([419.25, 420.25, 421.25], "float") }, { k: new guid(420n), v: f.assemblyList([421.25, 422.25, 423.25], "float") }]), new guid(422n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(424n), v: f.assemblyList([425n, 426n, 427n], "guid") }, { k: new guid(426n), v: f.assemblyList([427n, 428n, 429n], "guid") }]), new guid(428n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(430n), v: f.assemblyList([431n, 432n, 433n], "int") }, { k: new guid(432n), v: f.assemblyList([433n, 434n, 435n], "int") }]), new guid(434n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(436n), v: f.assemblyList(["437", "438", "439"], "str") }, { k: new guid(438n), v: f.assemblyList(["439", "440", "441"], "str") }]), new guid(440n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(442n), v: f.assemblyList([[443, 444, 445], [444, 445, 446], [445, 446, 447]], "vec3") }, { k: new guid(444n), v: f.assemblyList([[445, 446, 447], [446, 447, 448], [447, 448, 449]], "vec3") }]), new guid(446n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(448n), v: new prefabId(449n) }, { k: new guid(450n), v: new prefabId(451n) }]), new guid(452n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(454n), v: "455" }, { k: new guid(456n), v: "457" }]), new guid(458n))
  // queryIfDictionaryContainsSpecificKey :: dict<guid, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new guid(460n), v: f.create3dVector(461, 462, 463) }, { k: new guid(462n), v: f.create3dVector(463, 464, 465) }]), new guid(464n))
  // queryIfDictionaryContainsSpecificKey :: dict<int, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 466n, v: true }, { k: 468n, v: true }]), 470n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 472n, v: new configId(473n) }, { k: 474n, v: new configId(475n) }]), 476n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 478n, v: f.getSelfEntity() }, { k: 480n, v: f.getSelfEntity() }]), 482n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 484n, v: new faction(485n) }, { k: 486n, v: new faction(487n) }]), 488n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 490n, v: 491.25 }, { k: 492n, v: 493.25 }]), 494n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 496n, v: new guid(497n) }, { k: 498n, v: new guid(499n) }]), 500n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 502n, v: 503n }, { k: 504n, v: 505n }]), 506n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 508n, v: f.assemblyList([true, false, true], "bool") }, { k: 510n, v: f.assemblyList([true, false, true], "bool") }]), 512n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 514n, v: f.assemblyList([515n, 516n, 517n], "config_id") }, { k: 516n, v: f.assemblyList([517n, 518n, 519n], "config_id") }]), 518n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 520n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: 523n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), 526n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 528n, v: f.assemblyList([529n, 530n, 531n], "faction") }, { k: 530n, v: f.assemblyList([531n, 532n, 533n], "faction") }]), 532n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 534n, v: f.assemblyList([535.25, 536.25, 537.25], "float") }, { k: 536n, v: f.assemblyList([537.25, 538.25, 539.25], "float") }]), 538n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 540n, v: f.assemblyList([541n, 542n, 543n], "guid") }, { k: 542n, v: f.assemblyList([543n, 544n, 545n], "guid") }]), 544n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 546n, v: f.assemblyList([547n, 548n, 549n], "int") }, { k: 548n, v: f.assemblyList([549n, 550n, 551n], "int") }]), 550n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 552n, v: f.assemblyList(["553", "554", "555"], "str") }, { k: 554n, v: f.assemblyList(["555", "556", "557"], "str") }]), 556n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 558n, v: f.assemblyList([[559, 560, 561], [560, 561, 562], [561, 562, 563]], "vec3") }, { k: 560n, v: f.assemblyList([[561, 562, 563], [562, 563, 564], [563, 564, 565]], "vec3") }]), 562n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 564n, v: new prefabId(565n) }, { k: 566n, v: new prefabId(567n) }]), 568n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 570n, v: "571" }, { k: 572n, v: "573" }]), 574n)
  // queryIfDictionaryContainsSpecificKey :: dict<int, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: 576n, v: f.create3dVector(577, 578, 579) }, { k: 578n, v: f.create3dVector(579, 580, 581) }]), 580n)
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(582n), v: true }, { k: new prefabId(584n), v: true }]), new prefabId(586n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(588n), v: new configId(589n) }, { k: new prefabId(590n), v: new configId(591n) }]), new prefabId(592n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(594n), v: f.getSelfEntity() }, { k: new prefabId(596n), v: f.getSelfEntity() }]), new prefabId(598n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(600n), v: new faction(601n) }, { k: new prefabId(602n), v: new faction(603n) }]), new prefabId(604n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(606n), v: 607.25 }, { k: new prefabId(608n), v: 609.25 }]), new prefabId(610n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(612n), v: new guid(613n) }, { k: new prefabId(614n), v: new guid(615n) }]), new prefabId(616n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(618n), v: 619n }, { k: new prefabId(620n), v: 621n }]), new prefabId(622n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(624n), v: f.assemblyList([true, false, true], "bool") }, { k: new prefabId(626n), v: f.assemblyList([true, false, true], "bool") }]), new prefabId(628n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(630n), v: f.assemblyList([631n, 632n, 633n], "config_id") }, { k: new prefabId(632n), v: f.assemblyList([633n, 634n, 635n], "config_id") }]), new prefabId(634n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(636n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new prefabId(639n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), new prefabId(642n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(644n), v: f.assemblyList([645n, 646n, 647n], "faction") }, { k: new prefabId(646n), v: f.assemblyList([647n, 648n, 649n], "faction") }]), new prefabId(648n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(650n), v: f.assemblyList([651.25, 652.25, 653.25], "float") }, { k: new prefabId(652n), v: f.assemblyList([653.25, 654.25, 655.25], "float") }]), new prefabId(654n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(656n), v: f.assemblyList([657n, 658n, 659n], "guid") }, { k: new prefabId(658n), v: f.assemblyList([659n, 660n, 661n], "guid") }]), new prefabId(660n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(662n), v: f.assemblyList([663n, 664n, 665n], "int") }, { k: new prefabId(664n), v: f.assemblyList([665n, 666n, 667n], "int") }]), new prefabId(666n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(668n), v: f.assemblyList(["669", "670", "671"], "str") }, { k: new prefabId(670n), v: f.assemblyList(["671", "672", "673"], "str") }]), new prefabId(672n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(674n), v: f.assemblyList([[675, 676, 677], [676, 677, 678], [677, 678, 679]], "vec3") }, { k: new prefabId(676n), v: f.assemblyList([[677, 678, 679], [678, 679, 680], [679, 680, 681]], "vec3") }]), new prefabId(678n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(680n), v: new prefabId(681n) }, { k: new prefabId(682n), v: new prefabId(683n) }]), new prefabId(684n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(686n), v: "687" }, { k: new prefabId(688n), v: "689" }]), new prefabId(690n))
  // queryIfDictionaryContainsSpecificKey :: dict<prefabId, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: new prefabId(692n), v: f.create3dVector(693, 694, 695) }, { k: new prefabId(694n), v: f.create3dVector(695, 696, 697) }]), new prefabId(696n))
  // queryIfDictionaryContainsSpecificKey :: dict<str, bool>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "698", v: true }, { k: "700", v: true }]), "702")
  // queryIfDictionaryContainsSpecificKey :: dict<str, configId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "704", v: new configId(705n) }, { k: "706", v: new configId(707n) }]), "708")
  // queryIfDictionaryContainsSpecificKey :: dict<str, entity>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "710", v: f.getSelfEntity() }, { k: "712", v: f.getSelfEntity() }]), "714")
  // queryIfDictionaryContainsSpecificKey :: dict<str, faction>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "716", v: new faction(717n) }, { k: "718", v: new faction(719n) }]), "720")
  // queryIfDictionaryContainsSpecificKey :: dict<str, float>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "722", v: 723.25 }, { k: "724", v: 725.25 }]), "726")
  // queryIfDictionaryContainsSpecificKey :: dict<str, guid>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "728", v: new guid(729n) }, { k: "730", v: new guid(731n) }]), "732")
  // queryIfDictionaryContainsSpecificKey :: dict<str, int>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "734", v: 735n }, { k: "736", v: 737n }]), "738")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<bool>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "740", v: f.assemblyList([true, false, true], "bool") }, { k: "742", v: f.assemblyList([true, false, true], "bool") }]), "744")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<configId>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "746", v: f.assemblyList([747n, 748n, 749n], "config_id") }, { k: "748", v: f.assemblyList([749n, 750n, 751n], "config_id") }]), "750")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<entity>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "752", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: "755", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]), "758")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<faction>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "760", v: f.assemblyList([761n, 762n, 763n], "faction") }, { k: "762", v: f.assemblyList([763n, 764n, 765n], "faction") }]), "764")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<float>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "766", v: f.assemblyList([767.25, 768.25, 769.25], "float") }, { k: "768", v: f.assemblyList([769.25, 770.25, 771.25], "float") }]), "770")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<guid>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "772", v: f.assemblyList([773n, 774n, 775n], "guid") }, { k: "774", v: f.assemblyList([775n, 776n, 777n], "guid") }]), "776")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<int>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "778", v: f.assemblyList([779n, 780n, 781n], "int") }, { k: "780", v: f.assemblyList([781n, 782n, 783n], "int") }]), "782")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<str>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "784", v: f.assemblyList(["785", "786", "787"], "str") }, { k: "786", v: f.assemblyList(["787", "788", "789"], "str") }]), "788")
  // queryIfDictionaryContainsSpecificKey :: dict<str, list<vec3>>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "790", v: f.assemblyList([[791, 792, 793], [792, 793, 794], [793, 794, 795]], "vec3") }, { k: "792", v: f.assemblyList([[793, 794, 795], [794, 795, 796], [795, 796, 797]], "vec3") }]), "794")
  // queryIfDictionaryContainsSpecificKey :: dict<str, prefabId>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "796", v: new prefabId(797n) }, { k: "798", v: new prefabId(799n) }]), "800")
  // queryIfDictionaryContainsSpecificKey :: dict<str, str>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "802", v: "803" }, { k: "804", v: "805" }]), "806")
  // queryIfDictionaryContainsSpecificKey :: dict<str, vec3>
  f.queryIfDictionaryContainsSpecificKey(f.assemblyDictionary([{ k: "808", v: f.create3dVector(809, 810, 811) }, { k: "810", v: f.create3dVector(811, 812, 813) }]), "812")
  // getListOfKeysFromDictionary :: dict<configId, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(2n), v: true }, { k: new configId(4n), v: true }]))
  // getListOfKeysFromDictionary :: dict<configId, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(7n), v: new configId(8n) }, { k: new configId(9n), v: new configId(10n) }]))
  // getListOfKeysFromDictionary :: dict<configId, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(12n), v: f.getSelfEntity() }, { k: new configId(14n), v: f.getSelfEntity() }]))
  // getListOfKeysFromDictionary :: dict<configId, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(17n), v: new faction(18n) }, { k: new configId(19n), v: new faction(20n) }]))
  // getListOfKeysFromDictionary :: dict<configId, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(22n), v: 23.25 }, { k: new configId(24n), v: 25.25 }]))
  // getListOfKeysFromDictionary :: dict<configId, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(27n), v: new guid(28n) }, { k: new configId(29n), v: new guid(30n) }]))
  // getListOfKeysFromDictionary :: dict<configId, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(32n), v: 33n }, { k: new configId(34n), v: 35n }]))
  // getListOfKeysFromDictionary :: dict<configId, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(37n), v: f.assemblyList([false, true, false], "bool") }, { k: new configId(39n), v: f.assemblyList([false, true, false], "bool") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(42n), v: f.assemblyList([43n, 44n, 45n], "config_id") }, { k: new configId(44n), v: f.assemblyList([45n, 46n, 47n], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(47n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new configId(50n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(54n), v: f.assemblyList([55n, 56n, 57n], "faction") }, { k: new configId(56n), v: f.assemblyList([57n, 58n, 59n], "faction") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(59n), v: f.assemblyList([60.25, 61.25, 62.25], "float") }, { k: new configId(61n), v: f.assemblyList([62.25, 63.25, 64.25], "float") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(64n), v: f.assemblyList([65n, 66n, 67n], "guid") }, { k: new configId(66n), v: f.assemblyList([67n, 68n, 69n], "guid") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(69n), v: f.assemblyList([70n, 71n, 72n], "int") }, { k: new configId(71n), v: f.assemblyList([72n, 73n, 74n], "int") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(74n), v: f.assemblyList(["75", "76", "77"], "str") }, { k: new configId(76n), v: f.assemblyList(["77", "78", "79"], "str") }]))
  // getListOfKeysFromDictionary :: dict<configId, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(79n), v: f.assemblyList([[80, 81, 82], [81, 82, 83], [82, 83, 84]], "vec3") }, { k: new configId(81n), v: f.assemblyList([[82, 83, 84], [83, 84, 85], [84, 85, 86]], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<configId, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(84n), v: new prefabId(85n) }, { k: new configId(86n), v: new prefabId(87n) }]))
  // getListOfKeysFromDictionary :: dict<configId, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(89n), v: "90" }, { k: new configId(91n), v: "92" }]))
  // getListOfKeysFromDictionary :: dict<configId, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new configId(94n), v: f.create3dVector(95, 96, 97) }, { k: new configId(96n), v: f.create3dVector(97, 98, 99) }]))
  // getListOfKeysFromDictionary :: dict<entity, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: false }, { k: f.getSelfEntity(), v: false }]))
  // getListOfKeysFromDictionary :: dict<entity, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new configId(105n) }, { k: f.getSelfEntity(), v: new configId(107n) }]))
  // getListOfKeysFromDictionary :: dict<entity, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.getSelfEntity() }, { k: f.getSelfEntity(), v: f.getSelfEntity() }]))
  // getListOfKeysFromDictionary :: dict<entity, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new faction(115n) }, { k: f.getSelfEntity(), v: new faction(117n) }]))
  // getListOfKeysFromDictionary :: dict<entity, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 120.25 }, { k: f.getSelfEntity(), v: 122.25 }]))
  // getListOfKeysFromDictionary :: dict<entity, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new guid(125n) }, { k: f.getSelfEntity(), v: new guid(127n) }]))
  // getListOfKeysFromDictionary :: dict<entity, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: 130n }, { k: f.getSelfEntity(), v: 132n }]))
  // getListOfKeysFromDictionary :: dict<entity, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }, { k: f.getSelfEntity(), v: f.assemblyList([true, false, true], "bool") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([140n, 141n, 142n], "config_id") }, { k: f.getSelfEntity(), v: f.assemblyList([142n, 143n, 144n], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: f.getSelfEntity(), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([152n, 153n, 154n], "faction") }, { k: f.getSelfEntity(), v: f.assemblyList([154n, 155n, 156n], "faction") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([157.25, 158.25, 159.25], "float") }, { k: f.getSelfEntity(), v: f.assemblyList([159.25, 160.25, 161.25], "float") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([162n, 163n, 164n], "guid") }, { k: f.getSelfEntity(), v: f.assemblyList([164n, 165n, 166n], "guid") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([167n, 168n, 169n], "int") }, { k: f.getSelfEntity(), v: f.assemblyList([169n, 170n, 171n], "int") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList(["172", "173", "174"], "str") }, { k: f.getSelfEntity(), v: f.assemblyList(["174", "175", "176"], "str") }]))
  // getListOfKeysFromDictionary :: dict<entity, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.assemblyList([[177, 178, 179], [178, 179, 180], [179, 180, 181]], "vec3") }, { k: f.getSelfEntity(), v: f.assemblyList([[179, 180, 181], [180, 181, 182], [181, 182, 183]], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<entity, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: new prefabId(182n) }, { k: f.getSelfEntity(), v: new prefabId(184n) }]))
  // getListOfKeysFromDictionary :: dict<entity, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: "187" }, { k: f.getSelfEntity(), v: "189" }]))
  // getListOfKeysFromDictionary :: dict<entity, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: f.getSelfEntity(), v: f.create3dVector(192, 193, 194) }, { k: f.getSelfEntity(), v: f.create3dVector(194, 195, 196) }]))
  // getListOfKeysFromDictionary :: dict<faction, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(196n), v: true }, { k: new faction(198n), v: true }]))
  // getListOfKeysFromDictionary :: dict<faction, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(201n), v: new configId(202n) }, { k: new faction(203n), v: new configId(204n) }]))
  // getListOfKeysFromDictionary :: dict<faction, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(206n), v: f.getSelfEntity() }, { k: new faction(208n), v: f.getSelfEntity() }]))
  // getListOfKeysFromDictionary :: dict<faction, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(211n), v: new faction(212n) }, { k: new faction(213n), v: new faction(214n) }]))
  // getListOfKeysFromDictionary :: dict<faction, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(216n), v: 217.25 }, { k: new faction(218n), v: 219.25 }]))
  // getListOfKeysFromDictionary :: dict<faction, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(221n), v: new guid(222n) }, { k: new faction(223n), v: new guid(224n) }]))
  // getListOfKeysFromDictionary :: dict<faction, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(226n), v: 227n }, { k: new faction(228n), v: 229n }]))
  // getListOfKeysFromDictionary :: dict<faction, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(231n), v: f.assemblyList([false, true, false], "bool") }, { k: new faction(233n), v: f.assemblyList([false, true, false], "bool") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(236n), v: f.assemblyList([237n, 238n, 239n], "config_id") }, { k: new faction(238n), v: f.assemblyList([239n, 240n, 241n], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(241n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new faction(244n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(248n), v: f.assemblyList([249n, 250n, 251n], "faction") }, { k: new faction(250n), v: f.assemblyList([251n, 252n, 253n], "faction") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(253n), v: f.assemblyList([254.25, 255.25, 256.25], "float") }, { k: new faction(255n), v: f.assemblyList([256.25, 257.25, 258.25], "float") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(258n), v: f.assemblyList([259n, 260n, 261n], "guid") }, { k: new faction(260n), v: f.assemblyList([261n, 262n, 263n], "guid") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(263n), v: f.assemblyList([264n, 265n, 266n], "int") }, { k: new faction(265n), v: f.assemblyList([266n, 267n, 268n], "int") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(268n), v: f.assemblyList(["269", "270", "271"], "str") }, { k: new faction(270n), v: f.assemblyList(["271", "272", "273"], "str") }]))
  // getListOfKeysFromDictionary :: dict<faction, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(273n), v: f.assemblyList([[274, 275, 276], [275, 276, 277], [276, 277, 278]], "vec3") }, { k: new faction(275n), v: f.assemblyList([[276, 277, 278], [277, 278, 279], [278, 279, 280]], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<faction, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(278n), v: new prefabId(279n) }, { k: new faction(280n), v: new prefabId(281n) }]))
  // getListOfKeysFromDictionary :: dict<faction, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(283n), v: "284" }, { k: new faction(285n), v: "286" }]))
  // getListOfKeysFromDictionary :: dict<faction, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new faction(288n), v: f.create3dVector(289, 290, 291) }, { k: new faction(290n), v: f.create3dVector(291, 292, 293) }]))
  // getListOfKeysFromDictionary :: dict<guid, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(293n), v: false }, { k: new guid(295n), v: false }]))
  // getListOfKeysFromDictionary :: dict<guid, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(298n), v: new configId(299n) }, { k: new guid(300n), v: new configId(301n) }]))
  // getListOfKeysFromDictionary :: dict<guid, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(303n), v: f.getSelfEntity() }, { k: new guid(305n), v: f.getSelfEntity() }]))
  // getListOfKeysFromDictionary :: dict<guid, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(308n), v: new faction(309n) }, { k: new guid(310n), v: new faction(311n) }]))
  // getListOfKeysFromDictionary :: dict<guid, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(313n), v: 314.25 }, { k: new guid(315n), v: 316.25 }]))
  // getListOfKeysFromDictionary :: dict<guid, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(318n), v: new guid(319n) }, { k: new guid(320n), v: new guid(321n) }]))
  // getListOfKeysFromDictionary :: dict<guid, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(323n), v: 324n }, { k: new guid(325n), v: 326n }]))
  // getListOfKeysFromDictionary :: dict<guid, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(328n), v: f.assemblyList([true, false, true], "bool") }, { k: new guid(330n), v: f.assemblyList([true, false, true], "bool") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(333n), v: f.assemblyList([334n, 335n, 336n], "config_id") }, { k: new guid(335n), v: f.assemblyList([336n, 337n, 338n], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(338n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new guid(341n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(345n), v: f.assemblyList([346n, 347n, 348n], "faction") }, { k: new guid(347n), v: f.assemblyList([348n, 349n, 350n], "faction") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(350n), v: f.assemblyList([351.25, 352.25, 353.25], "float") }, { k: new guid(352n), v: f.assemblyList([353.25, 354.25, 355.25], "float") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(355n), v: f.assemblyList([356n, 357n, 358n], "guid") }, { k: new guid(357n), v: f.assemblyList([358n, 359n, 360n], "guid") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(360n), v: f.assemblyList([361n, 362n, 363n], "int") }, { k: new guid(362n), v: f.assemblyList([363n, 364n, 365n], "int") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(365n), v: f.assemblyList(["366", "367", "368"], "str") }, { k: new guid(367n), v: f.assemblyList(["368", "369", "370"], "str") }]))
  // getListOfKeysFromDictionary :: dict<guid, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(370n), v: f.assemblyList([[371, 372, 373], [372, 373, 374], [373, 374, 375]], "vec3") }, { k: new guid(372n), v: f.assemblyList([[373, 374, 375], [374, 375, 376], [375, 376, 377]], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<guid, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(375n), v: new prefabId(376n) }, { k: new guid(377n), v: new prefabId(378n) }]))
  // getListOfKeysFromDictionary :: dict<guid, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(380n), v: "381" }, { k: new guid(382n), v: "383" }]))
  // getListOfKeysFromDictionary :: dict<guid, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new guid(385n), v: f.create3dVector(386, 387, 388) }, { k: new guid(387n), v: f.create3dVector(388, 389, 390) }]))
  // getListOfKeysFromDictionary :: dict<int, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 390n, v: true }, { k: 392n, v: true }]))
  // getListOfKeysFromDictionary :: dict<int, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 395n, v: new configId(396n) }, { k: 397n, v: new configId(398n) }]))
  // getListOfKeysFromDictionary :: dict<int, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 400n, v: f.getSelfEntity() }, { k: 402n, v: f.getSelfEntity() }]))
  // getListOfKeysFromDictionary :: dict<int, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 405n, v: new faction(406n) }, { k: 407n, v: new faction(408n) }]))
  // getListOfKeysFromDictionary :: dict<int, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 410n, v: 411.25 }, { k: 412n, v: 413.25 }]))
  // getListOfKeysFromDictionary :: dict<int, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 415n, v: new guid(416n) }, { k: 417n, v: new guid(418n) }]))
  // getListOfKeysFromDictionary :: dict<int, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 420n, v: 421n }, { k: 422n, v: 423n }]))
  // getListOfKeysFromDictionary :: dict<int, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 425n, v: f.assemblyList([false, true, false], "bool") }, { k: 427n, v: f.assemblyList([false, true, false], "bool") }]))
  // getListOfKeysFromDictionary :: dict<int, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 430n, v: f.assemblyList([431n, 432n, 433n], "config_id") }, { k: 432n, v: f.assemblyList([433n, 434n, 435n], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<int, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 435n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: 438n, v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // getListOfKeysFromDictionary :: dict<int, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 442n, v: f.assemblyList([443n, 444n, 445n], "faction") }, { k: 444n, v: f.assemblyList([445n, 446n, 447n], "faction") }]))
  // getListOfKeysFromDictionary :: dict<int, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 447n, v: f.assemblyList([448.25, 449.25, 450.25], "float") }, { k: 449n, v: f.assemblyList([450.25, 451.25, 452.25], "float") }]))
  // getListOfKeysFromDictionary :: dict<int, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 452n, v: f.assemblyList([453n, 454n, 455n], "guid") }, { k: 454n, v: f.assemblyList([455n, 456n, 457n], "guid") }]))
  // getListOfKeysFromDictionary :: dict<int, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 457n, v: f.assemblyList([458n, 459n, 460n], "int") }, { k: 459n, v: f.assemblyList([460n, 461n, 462n], "int") }]))
  // getListOfKeysFromDictionary :: dict<int, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 462n, v: f.assemblyList(["463", "464", "465"], "str") }, { k: 464n, v: f.assemblyList(["465", "466", "467"], "str") }]))
  // getListOfKeysFromDictionary :: dict<int, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 467n, v: f.assemblyList([[468, 469, 470], [469, 470, 471], [470, 471, 472]], "vec3") }, { k: 469n, v: f.assemblyList([[470, 471, 472], [471, 472, 473], [472, 473, 474]], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<int, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 472n, v: new prefabId(473n) }, { k: 474n, v: new prefabId(475n) }]))
  // getListOfKeysFromDictionary :: dict<int, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 477n, v: "478" }, { k: 479n, v: "480" }]))
  // getListOfKeysFromDictionary :: dict<int, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: 482n, v: f.create3dVector(483, 484, 485) }, { k: 484n, v: f.create3dVector(485, 486, 487) }]))
  // getListOfKeysFromDictionary :: dict<prefabId, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(487n), v: false }, { k: new prefabId(489n), v: false }]))
  // getListOfKeysFromDictionary :: dict<prefabId, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(492n), v: new configId(493n) }, { k: new prefabId(494n), v: new configId(495n) }]))
  // getListOfKeysFromDictionary :: dict<prefabId, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(497n), v: f.getSelfEntity() }, { k: new prefabId(499n), v: f.getSelfEntity() }]))
  // getListOfKeysFromDictionary :: dict<prefabId, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(502n), v: new faction(503n) }, { k: new prefabId(504n), v: new faction(505n) }]))
  // getListOfKeysFromDictionary :: dict<prefabId, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(507n), v: 508.25 }, { k: new prefabId(509n), v: 510.25 }]))
  // getListOfKeysFromDictionary :: dict<prefabId, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(512n), v: new guid(513n) }, { k: new prefabId(514n), v: new guid(515n) }]))
  // getListOfKeysFromDictionary :: dict<prefabId, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(517n), v: 518n }, { k: new prefabId(519n), v: 520n }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(522n), v: f.assemblyList([true, false, true], "bool") }, { k: new prefabId(524n), v: f.assemblyList([true, false, true], "bool") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(527n), v: f.assemblyList([528n, 529n, 530n], "config_id") }, { k: new prefabId(529n), v: f.assemblyList([530n, 531n, 532n], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(532n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: new prefabId(535n), v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(539n), v: f.assemblyList([540n, 541n, 542n], "faction") }, { k: new prefabId(541n), v: f.assemblyList([542n, 543n, 544n], "faction") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(544n), v: f.assemblyList([545.25, 546.25, 547.25], "float") }, { k: new prefabId(546n), v: f.assemblyList([547.25, 548.25, 549.25], "float") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(549n), v: f.assemblyList([550n, 551n, 552n], "guid") }, { k: new prefabId(551n), v: f.assemblyList([552n, 553n, 554n], "guid") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(554n), v: f.assemblyList([555n, 556n, 557n], "int") }, { k: new prefabId(556n), v: f.assemblyList([557n, 558n, 559n], "int") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(559n), v: f.assemblyList(["560", "561", "562"], "str") }, { k: new prefabId(561n), v: f.assemblyList(["562", "563", "564"], "str") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(564n), v: f.assemblyList([[565, 566, 567], [566, 567, 568], [567, 568, 569]], "vec3") }, { k: new prefabId(566n), v: f.assemblyList([[567, 568, 569], [568, 569, 570], [569, 570, 571]], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<prefabId, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(569n), v: new prefabId(570n) }, { k: new prefabId(571n), v: new prefabId(572n) }]))
  // getListOfKeysFromDictionary :: dict<prefabId, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(574n), v: "575" }, { k: new prefabId(576n), v: "577" }]))
  // getListOfKeysFromDictionary :: dict<prefabId, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: new prefabId(579n), v: f.create3dVector(580, 581, 582) }, { k: new prefabId(581n), v: f.create3dVector(582, 583, 584) }]))
  // getListOfKeysFromDictionary :: dict<str, bool>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "584", v: true }, { k: "586", v: true }]))
  // getListOfKeysFromDictionary :: dict<str, configId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "589", v: new configId(590n) }, { k: "591", v: new configId(592n) }]))
  // getListOfKeysFromDictionary :: dict<str, entity>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "594", v: f.getSelfEntity() }, { k: "596", v: f.getSelfEntity() }]))
  // getListOfKeysFromDictionary :: dict<str, faction>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "599", v: new faction(600n) }, { k: "601", v: new faction(602n) }]))
  // getListOfKeysFromDictionary :: dict<str, float>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "604", v: 605.25 }, { k: "606", v: 607.25 }]))
  // getListOfKeysFromDictionary :: dict<str, guid>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "609", v: new guid(610n) }, { k: "611", v: new guid(612n) }]))
  // getListOfKeysFromDictionary :: dict<str, int>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "614", v: 615n }, { k: "616", v: 617n }]))
  // getListOfKeysFromDictionary :: dict<str, list<bool>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "619", v: f.assemblyList([false, true, false], "bool") }, { k: "621", v: f.assemblyList([false, true, false], "bool") }]))
  // getListOfKeysFromDictionary :: dict<str, list<configId>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "624", v: f.assemblyList([625n, 626n, 627n], "config_id") }, { k: "626", v: f.assemblyList([627n, 628n, 629n], "config_id") }]))
  // getListOfKeysFromDictionary :: dict<str, list<entity>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "629", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }, { k: "632", v: f.assemblyList([f.getSelfEntity(), f.getSelfEntity(), f.getSelfEntity()], "entity") }]))
  // getListOfKeysFromDictionary :: dict<str, list<faction>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "636", v: f.assemblyList([637n, 638n, 639n], "faction") }, { k: "638", v: f.assemblyList([639n, 640n, 641n], "faction") }]))
  // getListOfKeysFromDictionary :: dict<str, list<float>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "641", v: f.assemblyList([642.25, 643.25, 644.25], "float") }, { k: "643", v: f.assemblyList([644.25, 645.25, 646.25], "float") }]))
  // getListOfKeysFromDictionary :: dict<str, list<guid>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "646", v: f.assemblyList([647n, 648n, 649n], "guid") }, { k: "648", v: f.assemblyList([649n, 650n, 651n], "guid") }]))
  // getListOfKeysFromDictionary :: dict<str, list<int>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "651", v: f.assemblyList([652n, 653n, 654n], "int") }, { k: "653", v: f.assemblyList([654n, 655n, 656n], "int") }]))
  // getListOfKeysFromDictionary :: dict<str, list<str>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "656", v: f.assemblyList(["657", "658", "659"], "str") }, { k: "658", v: f.assemblyList(["659", "660", "661"], "str") }]))
  // getListOfKeysFromDictionary :: dict<str, list<vec3>>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "661", v: f.assemblyList([[662, 663, 664], [663, 664, 665], [664, 665, 666]], "vec3") }, { k: "663", v: f.assemblyList([[664, 665, 666], [665, 666, 667], [666, 667, 668]], "vec3") }]))
  // getListOfKeysFromDictionary :: dict<str, prefabId>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "666", v: new prefabId(667n) }, { k: "668", v: new prefabId(669n) }]))
  // getListOfKeysFromDictionary :: dict<str, str>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "671", v: "672" }, { k: "673", v: "674" }]))
  // getListOfKeysFromDictionary :: dict<str, vec3>
  f.getListOfKeysFromDictionary(f.assemblyDictionary([{ k: "676", v: f.create3dVector(677, 678, 679) }, { k: "678", v: f.create3dVector(679, 680, 681) }]))
})

