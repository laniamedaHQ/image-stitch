# PRD: Color Explorer Second Look (Agent Handoff)

Date: March 4, 2026  
Status: Draft for implementation  
Product: Laniameda Image Stitch (`image-stitch`)  
Area: `Colors` mode (`ColorExplorerView`)

## 1. Problem and Why Now

Laniameda users need fast, reliable color + typography guidance while working on AI creative workflows. We upgraded Color Explorer from random swatches to a semantic generator, but this is a first pass. We now need a second-look agent to harden quality and ship a production-grade experience.

Why now:
- Color Explorer is a core differentiator for creator workflows.
- We already have a working baseline (palette engine + contrast + typography suggestions).
- This is the right moment to improve trust, usability, and monetization with an AI Pro layer.

## 2. Vision

Color Explorer should feel like a practical design copilot:
- Input brand seed colors.
- Get design-system-ready tokens and readable typography suggestions.
- Trust accessibility scores.
- Upgrade to Pro for curated, intent-aware variations powered by AI.

## 3. Success Metrics

Primary:
- `>= 90%` of generated systems pass AA contrast checks for body/CTA/link tokens by default.
- `>= 35%` of Color Explorer sessions export or copy tokens (proxy for utility).
- `>= 15%` CTR from free mode to Pro “Generate Pro Variant”.

Secondary:
- Time to first usable palette `< 10s`.
- Color Explorer retention (7-day revisit) improves by `>= 20%`.

## 4. Target Users and Jobs

1. AI creators with low design confidence  
Job: “Give me a safe, professional palette and fonts from 1–3 brand colors.”

2. Designers/marketers moving fast  
Job: “Generate variants quickly, export tokens, and apply to landing/UI work.”

3. Power users (Pro)  
Job: “Use AI to refine palette style direction with rationale and usage notes.”

## 5. Current Baseline (What Exists)

Current implementation lives in:
- `views/ColorExplorerView.tsx`
- `utils/designSystem.ts`

Already implemented:
- Multi-seed hex input + style direction.
- Deterministic semantic token generation.
- Contrast scoring and auto-adjustment.
- Curated typography pairing logic.
- CSS variable export block.
- AI prompt contract preview for Pro tier.

## 6. Scope for Second Look

### In Scope (P0)

1. Quality audit + algorithm refinements
- Validate token generation consistency across edge-case seed colors.
- Improve hue/saturation logic for extreme inputs (neons, near-grays, very dark seeds).
- Ensure stable outputs for the same input (no hidden randomness).

2. Accessibility hardening
- Enforce AA thresholds for all key text roles.
- Improve error/warning surfacing when any role fails target contrast.
- Add explicit text-size assumptions for each contrast check.

3. UX clarity
- Better empty/error states for invalid hex input.
- Clear “free vs Pro” boundaries in UI copy.
- Add one-click “Copy token set” actions for palette/typography blocks.

4. Pro AI readiness (backend contract)
- Define API payload/response schema for Pro generation.
- Add runtime schema validation and fallback behavior.
- Track failure states (timeouts, invalid JSON, low-contrast outputs).

### In Scope (P1)

1. Export improvements
- JSON Design Tokens export.
- Tailwind config snippet export.
- CSS variables export polish (copy/download).

2. Variant generation
- Generate `N=3` curated variants in Pro mode.
- Display rationale + usage notes per variant.

3. Presets
- Save/load recent palettes locally.
- Starter presets by design direction.

### Out of Scope (for this PRD cycle)
- Full account system/billing implementation.
- Cross-project theme sync.
- Rebuilding core Stitch/Smart Stitch flows.

## 7. Requirements

### Functional Requirements

FR1. Input handling
- Accept hex colors with `#` or without.
- Support comma/space/semicolon separators.
- Reject invalid values with actionable guidance.

FR2. Semantic system generation
- Output at minimum: `primary`, `secondary`, `accent`, `background`, `surface`, `border`, `textPrimary`, `textSecondary`, `buttonBackground`, `buttonText`, `link`.

FR3. Typography recommendation
- Return one pairing with headline/body/mono and rationale.
- Ensure preview uses available loaded fonts with stable fallback stack.

FR4. Accessibility reporting
- Show per-role contrast ratio and target.
- Mark pass/fail status clearly.
- If fail, provide recommended fix or auto-correct explanation.

FR5. Pro AI integration contract
- Request includes seeds, direction, current palette, typography, user intent.
- Response must be strict JSON schema (validated client-side).
- On schema fail: show retry/fallback to local generator.

### Non-Functional Requirements

NFR1. Performance
- Local generation should complete `< 100ms` on modern desktop.

NFR2. Reliability
- No hard crash from malformed input or malformed Pro response.

NFR3. Maintainability
- Keep palette logic modular in `utils/designSystem.ts`.
- Add tests for key transformation and contrast utilities.

## 8. Agent Work Plan (Execution Order)

1. Baseline review
- Read current implementation and produce a short audit note:
  - What’s good
  - What breaks
  - Top 5 fixes by impact

2. Algorithm pass
- Improve color transform rules for edge cases.
- Add deterministic tests for representative seed sets.

3. Accessibility pass
- Add stricter checks and UX messaging.
- Validate against WCAG thresholds for documented text sizes.

4. UX pass
- Improve interactions, copy, and export ergonomics.
- Add “copy” affordances and clearer statuses.

5. Pro API scaffolding
- Implement API client + schema validation + fallback.
- Add event instrumentation.

6. Final verification
- Build, test, and produce before/after summary with screenshots.

## 9. Acceptance Criteria (Definition of Done)

1. Core quality
- For a test matrix of at least 25 seed combinations, all key text roles pass AA or are auto-corrected with visible explanation.

2. UX
- Invalid input is handled gracefully without silent failure.
- Users can copy/export generated tokens in at least two formats.

3. Pro readiness
- Pro request/response schema is implemented and validated.
- Failure fallback to local mode works in all simulated error cases.

4. Engineering quality
- Production build passes.
- Tests added for color parsing, contrast, and generation invariants.

## 10. Telemetry and Experiments

Track:
- `color_generate_clicked`
- `color_generate_success`
- `color_export_clicked` (format dimension)
- `pro_variant_clicked`
- `pro_variant_success`
- `pro_variant_failure` (error_type dimension)

Experiment ideas:
- A/B “Generate Pro Variant” CTA placement and copy.
- A/B number of free previews before Pro prompt.

## 11. Risks and Mitigations

Risk: AI returns pretty but low-accessibility palettes.  
Mitigation: post-validate and auto-correct before display.

Risk: Too many controls overwhelm non-designers.  
Mitigation: keep defaults smart; hide advanced options progressively.

Risk: Output feels repetitive.  
Mitigation: tune direction presets and introduce controlled variation logic.

## 12. Open Questions

1. Which model/provider powers Pro in v1?
2. Should Pro variants be streamed or returned as a single payload?
3. Should we gate by soft usage limits before billing exists?
4. Do we persist user palettes locally only, or attach to account later?

## 13. Deliverables for the Next Agent

1. Code changes implementing P0 scope.
2. Test coverage for core generator + contrast rules.
3. Short changelog with before/after behavior.
4. Follow-up proposal for P1 rollout.
