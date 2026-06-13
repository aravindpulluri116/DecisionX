
# DecisionX Landing Page

Build a category-defining marketing site for DecisionX on the existing TanStack Start stack. Frontend only, mock data, MapLibre for cartography. Visual + motion bar: Palantir / Bloomberg / Linear / Stripe.

## Design system

- **Palette** (tokens in `src/styles.css`, all `oklch`): bg `#F8FAFC`, surface `#FFFFFF`, ink `#0F172A`, accent `#2563EB`, positive `#15803D`, warning `#CA8A04`, negative `#B91C1C`, border `#E2E8F0`. Plus derived tokens: `--grid-line`, `--ink-muted`, `--accent-glow`, `--surface-elevated`.
- **Typography**: Sora (display) + Inter (body), loaded via `<link>` in `__root.tsx` head, registered as `--font-display` / `--font-sans` in `@theme`. Oversized editorial headlines (clamp-based, up to ~10vw), tight tracking on display, generous line-height on body.
- **Texture**: hairline 1px borders, monospaced data labels (JetBrains Mono via fontsource), faint dotted grid background, no glassmorphism, no gradients-as-decoration. Accent used sparingly as a signal color.
- **Motion principles**: purposeful, never decorative. Framer Motion for component-level, GSAP + ScrollTrigger for scroll choreography, R3F for hero. Respect `prefers-reduced-motion`.

## Page structure (single route, `src/routes/index.tsx`)

```text
<SiteHeader />                    sticky, hairline border, mono nav, magnetic CTA
<HeroDecisionUniverse />          3D consequence graph + headline
<SectionProblem />                animated stats — "decisions made blind"
<SectionRippleEffect />           interactive 2D consequence graph (SVG/Canvas)
<SectionHowItWorks />             5-step pipeline, scroll-pinned reveal
<SectionSimulator />              live mock simulator with sliders
<SectionDashboardPreview />       full-bleed intelligence wall mock
<SectionMapPreview />             MapLibre with stylized layers
<SiteFooter />                    editorial, oversized wordmark
```

## Hero — Decision Universe (R3F)

- Central rotating decision node (icosahedron wireframe + soft glow, accent-tinted) labeled by a cycling decision (`"Build Metro"`, `"Increase Bus Fare"`, `"Industrial Zone"`, `"New Highway"`).
- On a timer (and on hover/click), emit concentric ripple rings that propagate outward through a pre-laid network of ~40 secondary nodes positioned on a sphere/disc.
- As each ring crosses a node, that node ignites and reveals a label drawn from a consequence chain (`Metro → Traffic Reduction → Property Growth → Rental Inflation`). Labels are HTML overlays via `<Html>` from drei, anchored to node positions, so typography stays crisp.
- Connections drawn as thin animated lines (shader-based dashed flow). No bloom, no neon — accent blue on near-white background.
- Camera: slow orbit, subtle parallax on pointer move.
- Headline + subhead + CTAs sit left-aligned over the canvas; canvas occupies right ~60% on desktop, full-bleed background on mobile with reduced node count.
- CTAs: **Start Simulation** (scrolls to simulator), **Watch Scenario** (opens a modal that plays a scripted hero animation).

## Scroll sections

1. **The Problem** — three oversized stats (e.g. "73% of major infrastructure projects miss their stated impact targets") animated via GSAP number tween on enter. Editorial layout: huge numeral, hairline rule, small caption.
2. **The Ripple Effect** — interactive 2D force-directed graph (custom SVG, no extra library). User clicks a seed decision; consequences cascade outward with staggered Framer Motion. Hover a node → tooltip with calc factors.
3. **How DecisionX Works** — horizontal pinned scroll (GSAP ScrollTrigger) revealing 5 stages: Input → Simulation → Impact Modeling → Stakeholder Analysis → Decision Intelligence. Each stage = monospaced step number, oversized title, supporting micro-viz.
4. **Scenario Simulator** — three shadcn `Slider`s (Budget, Population, Route variant). Recharts radial + bar combo updates live with derived mock formulas (deterministic, no randomness). Toast on big threshold crossings via Sonner.
5. **Dashboard Preview** — full-bleed "intelligence wall": grid of panels (economic gauge, social sentiment radial, environmental delta sparkline, stakeholder matrix, decision log). Not cards — connected by hairline rules into one continuous surface.
6. **Map Preview** — MapLibre GL with `https://demotiles.maplibre.org/style.json` as the base, custom paint overrides to desaturate. Three toggleable mock layers (Population, Environment, Impact Zones) rendered as GeoJSON polygons with accent fills.

## Microinteractions

- Magnetic primary buttons (pointer-follow translate, capped).
- Link underline reveal (`story-link` pattern).
- Node hover anywhere → preview card with consequence chain.
- Cursor-follow spotlight in hero only.
- Section transitions use a thin accent progress rule at the top of viewport.

## Component layout

```text
src/routes/index.tsx
src/components/site/
  SiteHeader.tsx
  SiteFooter.tsx
  MagneticButton.tsx
  SectionLabel.tsx           mono eyebrow + rule
src/components/hero/
  HeroDecisionUniverse.tsx   wraps R3F Canvas + overlay
  DecisionUniverseScene.tsx  R3F scene
  ConsequenceNode.tsx
  RippleRings.tsx
  decisionData.ts            seed decisions + consequence chains
src/components/sections/
  SectionProblem.tsx
  SectionRippleEffect.tsx
  RippleGraph.tsx
  SectionHowItWorks.tsx
  SectionSimulator.tsx
  SimulatorControls.tsx
  SimulatorResults.tsx
  SectionDashboardPreview.tsx
  panels/{EconomicGauge,SocialSentiment,EnvironmentalDelta,StakeholderMatrix,DecisionLog}.tsx
  SectionMapPreview.tsx
src/lib/
  mock/{decisions,consequences,simulator,dashboard,geo}.ts
  motion.ts                  shared variants, reduced-motion helper
```

## Dependencies to add

`three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`, `gsap`, `recharts`, `maplibre-gl`, `@fontsource-variable/sora`, `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`. shadcn `slider`, `dialog`, `tooltip`, `sonner` if not already wired.

## SEO + head

Route-level `head()` on `/`: title "DecisionX — Measure the impact before making the decision.", description per spec, og:title/og:description, twitter card. Single H1 in hero.

## Out of scope (this pass)

- Authenticated command center, decision canvas app, persistence, auth.
- Real geospatial data, real ML.
- Mobile parity beyond "adapted and legible" — desktop-first per spec.

## Acceptance bar

- Loads with no console errors, hero animates within 1s on a mid laptop.
- Reduced-motion users get a static composed hero (no canvas rotation) and skipped scroll pins.
- No purple gradients, no neon, no glassmorphism, no stock illustrations, no AI-brain imagery.
- Visual hierarchy reads as "intelligence platform" before the user reads a single word.
