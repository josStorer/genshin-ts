# Editor Boundaries

This template is code-first, but not editor-free. AI should prefer implementing gameplay rules in code while clearly separating runtime logic from editor-authored resources and configuration.

Language note:
- Use this file when working in English.
- When working in Chinese, prefer `docs/EDITOR_BOUNDARIES_ZH.md` so editor and gameplay terminology stays idiomatic.

## Core Rule
- Prefer code for runtime logic: state machines, timers, wave flow, economy, validation, spawning, destruction, settlement, and signal-driven orchestration.
- Do not assume editor resources already exist. If a feature depends on editor-authored assets, components, templates, or IDs, call that out explicitly.
- Do not describe editor capabilities from guesswork. If local editor references exist, check them first.

## What Must Be Done In The Editor
- Scene and map setup: terrain, spawn points, revive points, navigation, placed entities, layout, decoration.
- Node graph containers and injection targets: the target NodeGraph must already exist and be saved in the map.
- Prefabs / prefab groups / assets: buildings, enemies, drops, effects, UI assets, audio assets, icons.
- Component attachment and base configuration: components can be configured in the editor and used by code, but are not created dynamically at runtime.
- Paths, patrols, and baked navigation-related content.
- UI layout, UI control groups, interaction buttons, timer controls, scoreboard controls.
- Signal definitions in the sandbox signal manager.
- Global timer definitions in the global timer manager.
- Shop templates, currency definitions, backpack templates, and shop components.
- Ability units, combat presets, and other battle-side authored data.
- Text bubbles, minimap markers, sound-effect players, nameplates, and similar presentation resources.

## What Should Usually Be Implemented In Code
- Game phases and state transitions.
- Build / occupy / unlock logic.
- Economy calculations, rewards, prices, and production cycles.
- Wave scheduling, spawn sequencing, and alive-count tracking.
- Runtime prefab creation, removal, and settlement triggers.
- UI visibility switching, control-group activation, and button event handling.
- Signal routing and cross-entity coordination.

## Critical Boundary Notes
- Components are editor-authored. Runtime logic may toggle or modify some component behavior, but should not assume components can be added or removed during play.
- Normal timers can be created directly in node graphs.
- Global timers must be defined in the editor first; code only references them by name.
- `createPrefab` / `createPrefabGroup` create authored prefab resources at runtime; they do not create new editor assets.
- Shop flow is not "open from nothing". It requires editor-authored currency, shop templates, backpack support, and a shop component.
- If using standard attack flow, authored ability units are required. If those are missing, code may need a simpler fallback such as direct HP loss.

## AI Working Rules
- For any feature request, separate the answer into:
  - code changes
  - editor setup still required
- If blocked by missing editor setup, say exactly what is missing instead of silently assuming it exists.
- When proposing a design, choose the most code-driven approach that still respects editor boundaries.
- If local editor reference docs are available in the workspace, prefer them as the factual source for editor behavior before making claims.
- When responding in Chinese, prefer the terminology used by the Chinese docs rather than ad hoc English-to-Chinese translation.

## Suggested Response Pattern
- First state what can be implemented in code now.
- Then list the minimum editor configuration required.
- Then note any assumptions about IDs, templates, authored components, or assets.

## Optional Reference
- For broader editor-side documentation and terminology, you may consult [Miliastra-knowledge](https://github.com/1475505/Miliastra-knowledge).
- If local editor docs exist in the workspace, prefer those as the primary source of truth. This repository is supplemental, not a template dependency.
