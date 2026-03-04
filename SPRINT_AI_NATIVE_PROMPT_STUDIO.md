# Sprint Plan: AI-Native Prompt Studio for Color Explorer

Date: 2026-03-04
Status: Ready for execution
Owner: Image Stitch product + engineering

## 1. Product Goal
Transform Color Explorer from a "settings + outputs" tool into an AI-native design copilot where users can:
1. Create a design system with minimal clicks.
2. Compose context-rich prompts for external agents/tools.
3. One-click copy an agent-ready prompt pack tailored to their target use case.

Primary UX principle: minimize forms/windows and maximize direct manipulation (chips, drag/drop, one-click actions).

## 2. AI-Native Interaction Model

### 2.1 Single-screen flow (no modal maze)
1. Input seeds and direction.
2. Tune with chips/sliders/presets (inline).
3. See generated tokens/contrast/typography instantly.
4. Build prompt profile (target + depth + style) in one dock.
5. One-click copy prompt and paste in any agent/project.

### 2.2 Direct manipulation controls
1. Drag role chips (`primary`, `accent`, `surface`) into a "prompt focus" lane.
2. Drag output mode chips (`web-ui`, `design-system`, `typography`, `color-grading`, `general-design`) into a "deliverable" lane.
3. Inline toggles for strictness (`Accessibility-first`, `Brand-strict`, `Creative-range`).

### 2.3 Prompt as product
Prompt output is first-class, not a debug preview. It must include:
1. Design intent.
2. Tokens and typography.
3. Accessibility constraints.
4. Usage instructions for agents.
5. Output format contract.

## 3. Skill Strategy (for prompt intelligence)
Use these local skills as source guidance for composing high-quality prompts:
1. `frontend-design`: distinctive UI direction and implementation constraints.
2. `laniameda-brand-design`: brand tone, tokens, typography, motion guardrails.
3. `ui-ux-pro-max`: accessibility/interaction heuristics.
4. `ai-product`: prompt reliability, validation, anti-demo patterns.
5. `web-design-guidelines`: accessibility and interface quality checks.

Output policy:
1. Never dump raw skill text.
2. Convert skill guidance into short, actionable constraints inside prompt templates.

## 4. Feature Set

## F1. Prompt Studio Panel (new)
A dedicated panel in Color Explorer containing:
1. Prompt target selector (`Web UI`, `Design System`, `Typography`, `Color Grading`, `General Design`).
2. Prompt depth selector (`Quick`, `Production`, `Strict Spec`).
3. Constraint toggles (`AA required`, `Token naming strict`, `No random colors`, `Brand voice`).
4. Live prompt preview (final compiled text).
5. One-click copy CTA.

## F2. Prompt Template Engine (new)
Generate prompt variants from templates:
1. `web_ui` template.
2. `design_system` template.
3. `typography` template.
4. `color_grading` template.
5. `general_design` template.

Each template receives structured context from generated system and selected controls.

## F3. Drag/Drop Prompt Composer (new)
Minimal DnD behavior:
1. Drag token role chips into "Must emphasize" list.
2. Reorder emphasis priorities.
3. Drag usage notes into "must include" instructions.

Fallback: keyboard-accessible move buttons.

## F4. One-click Copy Prompt Pack (new)
Copy final prompt instantly with:
1. Inline success state.
2. Clipboard fallback.
3. Optional secondary action: download `.md` prompt file.

## F5. Prompt Quality Guardrails (new)
Before copy:
1. Ensure required sections exist.
2. Ensure key tokens are present.
3. Ensure accessibility constraint is explicit when selected.
4. Warn for missing inputs (e.g., no valid seeds).

## 5. Technical Architecture

## 5.1 New modules
1. `utils/promptTemplates.ts`
   - Static template catalog keyed by prompt target.
2. `utils/promptComposer.ts`
   - `composeAgentPrompt(input: PromptComposeInput): PromptComposeResult`
   - Injects tokens, rules, formatting.
3. `utils/promptGuards.ts`
   - `validatePromptCompleteness(...)`
4. `utils/dragComposer.ts` (or local view logic first)
   - Chip ordering + emphasis serialization.

## 5.2 Types
Add prompt-specific types:
1. `PromptTarget`
2. `PromptDepth`
3. `PromptConstraint`
4. `PromptComposeInput`
5. `PromptComposeResult`

## 5.3 UI integration
Primary file: `views/ColorExplorerView.tsx`
1. Add Prompt Studio section below export block.
2. Keep visual language consistent with existing border/mono/rounded card system.

## 6. Ticket Backlog (Execution Order)

## Epic A: Prompt Engine Foundation

### T-A1: Prompt target/depth/constraint types + state
- Scope: Add types and UI state in Color Explorer.
- Acceptance:
  1. User can choose target and depth.
  2. Constraints toggles affect preview metadata.
- Depends on: none.

### T-A2: Template catalog
- Scope: Build templates for 5 targets.
- Acceptance:
  1. Each template has sections: context, constraints, output format.
  2. Templates produce coherent text without null placeholders.
- Depends on: T-A1.

### T-A3: Prompt composer utility
- Scope: Create deterministic prompt composer that merges design system + selected options.
- Acceptance:
  1. Same input => same prompt.
  2. Injects colors/fonts/contrast assumptions.
- Depends on: T-A2.

### T-A4: Guardrails validator
- Scope: Validate prompt completeness before copy.
- Acceptance:
  1. Missing critical sections blocked with actionable message.
  2. Pass state shows "ready to copy".
- Depends on: T-A3.

## Epic B: AI-Native UX Layer

### T-B1: Prompt Studio panel UI
- Scope: Add panel layout + controls + live preview.
- Acceptance:
  1. No new modal windows.
  2. Works in current page scroll structure.
- Depends on: T-A1, T-A3.

### T-B2: One-click copy prompt pack
- Scope: Copy final composed prompt.
- Acceptance:
  1. Clipboard success/failure states.
  2. Prompt content exactly matches preview.
- Depends on: T-B1, T-A4.

### T-B3: Download `.md` prompt file
- Scope: Optional export for external usage.
- Acceptance:
  1. Generated file includes timestamp + target + prompt body.
- Depends on: T-B2.

### T-B4: Drag/drop emphasis composer
- Scope: Drag chips for priority and must-include sections.
- Acceptance:
  1. DnD works mouse/touch.
  2. Keyboard fallback available.
- Depends on: T-B1.

### T-B5: Preset quick-actions for low-click flow
- Scope: "Web landing pack", "App UI pack", "Brand-only pack" buttons.
- Acceptance:
  1. One click sets target/depth/constraints.
  2. Preview refreshes instantly.
- Depends on: T-B1.

## Epic C: Quality + Validation

### T-C1: Unit tests for prompt templates/composer/guardrails
- Scope: Add tests for all prompt targets and constraint combinations.
- Acceptance:
  1. Snapshot/text assertions for each target.
  2. Guardrail failures covered.
- Depends on: T-A2, T-A3, T-A4.

### T-C2: UX validation tests
- Scope: Verify copy action, no-valid-seed behavior, toggle effects.
- Acceptance:
  1. Local test or scripted assertions pass.
- Depends on: T-B2, T-B5.

### T-C3: Final design QA pass
- Scope: Accessibility + visual consistency check against current component style.
- Acceptance:
  1. Contrast and keyboard behavior verified.
  2. No off-brand UI primitives.
- Depends on: all above.

## 7. Definition of Done
1. User can generate and copy a high-quality agent prompt in <= 2 interactions after palette generation.
2. Prompt includes tokens, typography, constraints, and expected output format.
3. No new complex modal flow introduced.
4. Tests cover core composer and guardrails.
5. Build and tests pass.

## 8. Sprint Sequence (Recommended)
Week 1:
1. T-A1, T-A2, T-A3, T-B1

Week 2:
1. T-A4, T-B2, T-B5, T-B3
2. T-B4 (if time)
3. T-C1, T-C2, T-C3

## 9. Next implementation command
Start with T-A1 + T-A2 + T-A3 in one branch-sized increment, then ship T-B1 immediately after so users can see value early.
