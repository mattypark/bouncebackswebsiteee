# Graph Report - Bouncebackwebsite  (2026-07-04)

## Corpus Check
- 53 files · ~28,421 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 227 nodes · 231 edges · 33 communities (27 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0280455e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_CartContext.tsx|CartContext.tsx]]
- [[_COMMUNITY_NavBar.tsx|NavBar.tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_BounceBack — Recycled Pickleball|BounceBack — Recycled Pickleball]]
- [[_COMMUNITY_Context — BounceBack Pickle Preorder Launch|Context — BounceBack Pickle: Preorder Launch]]
- [[_COMMUNITY_layout.tsx|layout.tsx]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_page.tsx|page.tsx]]
- [[_COMMUNITY_react-simple-maps.d.ts|react-simple-maps.d.ts]]
- [[_COMMUNITY_BounceBack — Google Apps Script Webhook|BounceBack — Google Apps Script Webhook]]
- [[_COMMUNITY_Fix Apps Script Gmail Permission Error|Fix: Apps Script Gmail Permission Error]]
- [[_COMMUNITY_route.ts|route.ts]]
- [[_COMMUNITY_BounceBack — Full Apps Script (copypaste)|BounceBack — Full Apps Script (copy/paste)]]
- [[_COMMUNITY_TestimonialsSection.tsx|TestimonialsSection.tsx]]
- [[_COMMUNITY_eslint.config.mjs|eslint.config.mjs]]
- [[_COMMUNITY_supabase.ts|supabase.ts]]
- [[_COMMUNITY_next.config.ts|next.config.ts]]
- [[_COMMUNITY_postcss.config.mjs|postcss.config.mjs]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `useCart()` - 9 edges
3. `BounceBack — Recycled Pickleball` - 7 edges
4. `Context — BounceBack Pickle: Preorder Launch` - 7 edges
5. `scripts` - 5 edges
6. `BounceBack — Google Apps Script Webhook` - 5 edges
7. `VIDEOS` - 4 edges
8. `Fix: Apps Script Gmail Permission Error` - 4 edges
9. `Getting Started` - 4 edges
10. `Payment link fix (DONE — pending deploy)` - 3 edges

## Surprising Connections (you probably didn't know these)
- `CartDrawer()` --calls--> `useCart()`  [EXTRACTED]
  components/CartDrawer.tsx → components/CartContext.tsx
- `CartIcon()` --calls--> `useCart()`  [EXTRACTED]
  components/CartIcon.tsx → components/CartContext.tsx
- `MerchCard()` --calls--> `useCart()`  [EXTRACTED]
  components/MerchSection.tsx → components/CartContext.tsx
- `PackCard()` --calls--> `useCart()`  [EXTRACTED]
  components/PreorderPacksSection.tsx → components/CartContext.tsx

## Import Cycles
- None detected.

## Communities (33 total, 6 thin omitted)

### Community 0 - "page.tsx"
Cohesion: 0.09
Nodes (9): videos, menuLinks, RecycledRevealSection(), TextRevealSection(), HEADLINE_WORDS, STEPS, balls, WhyChooseSection() (+1 more)

### Community 1 - "CartContext.tsx"
Cohesion: 0.12
Nodes (16): CartContext, CartContextValue, CartItem, useCart(), CartDrawer(), CartIcon(), MerchCard(), MerchSectionProps (+8 more)

### Community 2 - "NavBar.tsx"
Cohesion: 0.08
Nodes (11): milestones, values, benefits, dashboardSections, Tab, User, Location, LOCATION_DATA (+3 more)

### Community 3 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 4 - "dependencies"
Cohesion: 0.11
Nodes (18): dependencies, framer-motion, next, react, react-dom, react-simple-maps, resend, stripe (+10 more)

### Community 5 - "BounceBack — Recycled Pickleball"
Cohesion: 0.18
Nodes (10): BounceBack — Recycled Pickleball, Environment Variables, Features, Getting Started, License, Prerequisites, Production Build, Project Structure (+2 more)

### Community 6 - "Context — BounceBack Pickle: Preorder Launch"
Cohesion: 0.20
Nodes (9): Active workstreams, Apps Script (single source of truth), Backend migration: Supabase -> Kit (IN PROGRESS), Context — BounceBack Pickle: Preorder Launch, Misc shipped this launch, Payment flow (how col O gets written), Payment link fix (DONE — pending deploy), Repos (+1 more)

### Community 7 - "layout.tsx"
Cohesion: 0.28
Nodes (5): inter, metadata, CartProvider(), Providers(), SmoothScroll()

### Community 8 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+1 more)

### Community 9 - "page.tsx"
Cohesion: 0.29
Nodes (4): ADDITIONAL_BIN_OPTIONS, balls, FormData, US_STATES

### Community 10 - "react-simple-maps.d.ts"
Cohesion: 0.29
Nodes (6): AnnotationProps, ComposableMapProps, GeographiesProps, Geography, GeographyProps, MarkerProps

### Community 11 - "BounceBack — Google Apps Script Webhook"
Cohesion: 0.33
Nodes (5): BounceBack — Google Apps Script Webhook, Column reference, Deploy steps, The code, What it does

### Community 12 - "Fix: Apps Script Gmail Permission Error"
Cohesion: 0.40
Nodes (4): Fix: Apps Script Gmail Permission Error, If you previously removed access, Steps to fix, Why this happened

### Community 13 - "route.ts"
Cohesion: 0.67
Nodes (3): isRateLimited(), POST(), rateLimit

## Knowledge Gaps
- **104 isolated node(s):** `values`, `milestones`, `Tab`, `User`, `dashboardSections` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `values`, `milestones`, `Tab` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08620689655172414 - nodes in this community are weakly interconnected._
- **Should `CartContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12307692307692308 - nodes in this community are weakly interconnected._
- **Should `NavBar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._