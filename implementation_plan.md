# Yggdrasil — GitHub Event Visualizer

A stunning 3D visualization of live GitHub public event data, shaped as the Norse world-tree **Yggdrasil**. Each major branch represents an event type (Push, PullRequest, Issues, Fork, Star, etc.), sub-branches represent repositories, and glowing leaf nodes represent individual events — all animated and color-coded with vibrant lighting.

---

## Proposed Changes

### Project Scaffold

#### [NEW] Vite + React project at `c:\Users\arunk\Desktop\frontend\tree`
- Scaffolded with `npx create-vite@latest . --template react`
- Package manager: `npm`

---

### Dependencies

| Package | Purpose |
|---|---|
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | Helpers: OrbitControls, Stars, Text, etc. |
| `three` | Core 3D engine |
| `@react-spring/three` | Spring animations for 3D nodes |
| `motion` | UI overlay animations (successor to framer-motion) |

---

### GitHub API Layer

#### [NEW] `src/services/githubApi.js`
- Fetches `GET https://api.github.com/events?per_page=100` (publicly available, no auth required, 60 req/hr unauthenticated)
- Fetches `GET https://api.github.com/repos/{owner}/{repo}/events` for a specific repo
- Groups events by type: `PushEvent`, `PullRequestEvent`, `IssuesEvent`, `ForkEvent`, `WatchEvent`, `CreateEvent`, `DeleteEvent`, `ReleaseEvent`
- Returns a structured tree object:
```js
{
  root: { name: "GitHub", children: [
    { type: "PushEvent", count: N, repos: [...] },
    { type: "PullRequestEvent", count: N, repos: [...] },
    ...
  ]}
}
```
- Includes rich mock/fallback data for when rate-limit is hit

---

### 3D Yggdrasil Tree

#### [NEW] `src/components/YggdrasilTree.jsx`
- Main Three.js scene with `<Canvas>` from React Three Fiber
- **Trunk**: thick tapered cylinder rising from the center, dark bark texture via noise
- **Main branches**: One per event type (~6–8 types), curving outward using TubeGeometry along a CatmullRomCurve3-based spline  
- **Sub-branches**: Repositories — thinner tubes forking off each main branch
- **Leaf nodes**: Sphere/icosahedron per event, glowing emissive material, scaled by recency
- **Colors**:
  | Event Type | Color |
  |---|---|
  | PushEvent | `#00d4ff` (cyan) |
  | PullRequestEvent | `#bf5fff` (violet) |
  | IssuesEvent | `#ff4757` (red) |
  | ForkEvent | `#ffa502` (amber) |
  | WatchEvent | `#ffd700` (gold) |
  | CreateEvent | `#2ed573` (green) |
  | ReleaseEvent | `#ff6b81` (pink) |
- `OrbitControls` for full 3D navigation
- `Stars` background (particle star field)
- `PointLight` and ambient lighting for glow depth
- Tree gently sways using `useFrame` sine animation

#### [NEW] `src/components/Particles.jsx`
- Floating particle stream rising along active branches
- Colored to match their event type
- Animated upward drift using `useFrame`

#### [NEW] `src/components/Tooltip.jsx`
- On-hover raycasting via pointer events on leaf nodes
- Shows: repo name, event type, actor, timestamp
- Rendered as HTML overlay via `@react-three/drei Html`

---

### UI Overlay

#### [NEW] `src/components/HUD.jsx`
- Side panel with event counts per type (live updating)
- Top bar: repo search input (e.g., `facebook/react`, `torvalds/linux`)
- "Refresh" button to re-fetch latest events
- Color-coded legend matching tree branch colors
- Total events count, rate limit remaining display

#### [NEW] `src/components/LoadingScreen.jsx`
- Animated rune/tree logo while fetching data
- Fade transition to the 3D scene

---

### App Entry

#### [MODIFY] `src/App.jsx`
- Wraps `<Canvas>` scene + `<HUD>` overlay
- Global state via React Context: current events, selected repo, loading state

#### [MODIFY] `src/index.css`
- Dark cosmic background (`#050510`)
- Google Fonts: Inter
- HUD panel glass-morphism style

---

## Verification Plan

### Automated Tests

> The directory is currently empty — no existing tests. No test runner will be configured for this project (out of scope). Verification is via dev server + browser.

### Browser Verification (via browser tool after build)

1. Run `npm run dev` in `c:\Users\arunk\Desktop\frontend\tree`
2. Navigate to `http://localhost:5173`
3. Verify:
   - [ ] 3D scene loads with star background
   - [ ] Yggdrasil trunk and branches are visible
   - [ ] Leaf nodes glow with correct colors per event type
   - [ ] OrbitControls: drag to rotate, scroll to zoom
   - [ ] HUD panel shows event type counts
   - [ ] Hovering a leaf node shows tooltip with repo/actor/time
   - [ ] Searching a repo name re-fetches and rebuilds the tree
   - [ ] Loading screen appears on fetch, then fades out
   - [ ] No console errors
