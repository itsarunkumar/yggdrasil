# 🌳 Yggdrasil — 3D GitHub Event Visualizer

A stunning 3D visualization of live GitHub public event data, shaped as the Norse world-tree **Yggdrasil**. 

Immerse yourself in the GitHub ecosystem where each major branch represents an event type (Push, PullRequest, Issues, Fork, Star, etc.), sub-branches represent repositories, and glowing leaf nodes represent individual events — all animated and color-coded with vibrant lighting in a cosmic void. 🌌

## ✨ Features

- **3D Interactive Tree:** Procedurally generated 3D tree mapped to real-time GitHub activity.
- **Live Event Mapping:** Fetches and categorizes `PushEvent`, `PullRequestEvent`, `IssuesEvent`, `ForkEvent`, `WatchEvent`, and more!
- **Glowing Leaf Nodes:** Sphere/icosahedron leaves glow with emissive intensity based on recency, color-coded by event type.
- **Interactive UI:** Features a glass-morphic HUD, real-time event counts, and repository search capabilities.
- **Cosmic Environment:** Navigable 3D space with a drifting starfield and dynamic ambient lighting.

## 🛠️ Built With

- **React** + **Vite** — Fast, modern frontend framework
- **Three.js** — Core 3D engine driving the visualizations
- **React Three Fiber (R3F)** & **Drei** — Declarative 3D in React, orbit controls, text rendering, and more
- **React Spring** — Smooth physics-based springing and transitions
- **Motion** — High-performance UI overlay animations

## 🎨 Event Color Palette

| Event Type | Color |
|---|---|
| `PushEvent` | 🔵 Cyan (`#00d4ff`) |
| `PullRequestEvent` | 🟣 Violet (`#bf5fff`) |
| `IssuesEvent` | 🔴 Red (`#ff4757`) |
| `ForkEvent` | 🟠 Amber (`#ffa502`) |
| `WatchEvent` | 🟡 Gold (`#ffd700`) |
| `CreateEvent` | 🟢 Green (`#2ed573`) |
| `ReleaseEvent` | 💖 Pink (`#ff6b81`) |

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository and navigate into the project directory:
   ```bash
   git clone <repository-url>
   cd tree
   ```

2. Install the necessary dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open `http://localhost:5173` in your browser to experience the sacred timeline of GitHub events!

## 📜 License

This project is open-source and available under the MIT License.
