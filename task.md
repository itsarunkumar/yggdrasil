# Yggdrasil GitHub Visualizer - Task Checklist

## Planning
- [/] Research GitHub public event API endpoints
- [ ] Write implementation plan and get user approval

## Project Setup
- [ ] Scaffold Vite + React project in workspace
- [ ] Install dependencies: react-three-fiber, drei, three, framer-motion

## GitHub API Layer
- [ ] Create GitHub Events API service (public events, no auth needed)
- [ ] Parse events into typed tree structure (PushEvent, PullRequestEvent, IssuesEvent, ForkEvent, WatchEvent, etc.)
- [ ] Add demo/fallback data for rate limits

## 3D Yggdrasil Tree
- [ ] Build algorithmic tree geometry (trunk → branches → sub-branches → leaves)
- [ ] Map event categories → branches (push=blue, PR=purple, issues=red, fork=orange, star=yellow)
- [ ] Scale branch thickness by event frequency
- [ ] Add animated glowing particles on active nodes
- [ ] Add swaying/organic animation to tree

## UI / HUD Overlay
- [ ] Event type legend with live counts
- [ ] Repository selector / search input
- [ ] Stats panel (total events, top repos, etc.)
- [ ] Tooltip on node hover

## Polish
- [ ] Vibrant color palette and lighting (bloom/glow effects)
- [ ] Responsive layout
- [ ] Loading state

## Verification
- [ ] Dev server runs without errors
- [ ] Data fetches from GitHub API successfully
- [ ] Tree renders in 3D and is interactive (orbit controls)
- [ ] All event types color-coded correctly
