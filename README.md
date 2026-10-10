# D&D 5e Training Grounds ⚔️
**A Zero-Prep Single-Player Combat Testbed & Action-Economy Dojo for D&D 5e**

Live Deployment: [https://nckzvth.github.io/dnd-training-grounds/](https://nckzvth.github.io/dnd-training-grounds/)

---

## Overview

Virtual tabletops (*Roll20, Foundry VTT*) focus on multi-player sessions and require a DM. Character builders (*D&D Beyond, Fight Club 5e*) present static sheets in a vacuum.

**D&D 5e Training Grounds** provides a frictionless, zero-prep way to test how a character build actually handles movement, resource consumption, cover raycasting, and action timing on a grid before sitting down at a live table.

---

## Core Features

1. **Character Ingestion Hub**:
   - **Fillable PDF Ingestion**: Native client-side parser using `pdf-lib` extracts AcroForm fields (Name, AC, HP, Speed, Weapons, Features) in `<20ms` without server round-trips.
   - **Pre-Loaded Archetypes**: Comes pre-configured with *Arty the Level 3 Phantom Rogue*, *Valeros the Champion Fighter*, and *Ellywick the Evocation Wizard*.
   - **Combat-First Builder**: Instant 3-field custom statblock deployer for homebrew builds.

2. **Tactical 2D Battlemap Grid Engine**:
   - Interactive 5-ft tactical grid with split movement and pathfinding budgeting.
   - **Dynamic Raycast Cover Engine**: Automatically evaluates 4-corner sightlines against walls and obstacles to award **Half Cover (+2 AC)**, **Three-Quarters Cover (+5 AC)**, or Total Cover.
   - Difficult terrain (2x movement cost) and obstacle collision detection.

3. **Reactive Event Interceptor**:
   - Pauses execution during attack and damage windows to arbitrate real 5e reactions and conditional riders:
     - Prompts **Uncanny Dodge** to halve damage from visible attackers.
     - Prompts **Shield** (+5 AC) when an incoming roll beats AC by $\le 5$.
     - Prompts **Sneak Attack (+2d6)** whenever Advantage or an adjacent ally is verified.

4. **Companion Anchors (Party Synergy Simulation)**:
   - Features toggleable companion dummies (e.g. *Thorin the Dwarven Defender*) holding spaces and Dodging to validate party-dependent mechanics (Sneak Attack proximity, auras) without needing human teammates.

5. **State Rewind & Decision Forking**:
   - Instant timeline scrubbing (`undoTurn()`) allowing players to test alternative tactical lines from the exact same board state.

6. **Action Budget Diagnostics & Telemetry**:
   - Post-combat telemetry evaluates **Action Economy Leakage** (unused Bonus Actions and Reactions), **Defensive Exposure Index** (% of turns ended in open line-of-sight), and **Damage Overkill Inefficiency**.

---

## Local Development

```bash
# Clone the repository
git clone https://github.com/nckzvth/dnd-training-grounds.git
cd dnd-training-grounds

# Install dependencies
npm install

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## Technology Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **PDF Extraction**: `pdf-lib`
- **Spatial Geometry**: 2D Bresenham Raycasting & A* Pathfinding
- **Hosting**: GitHub Pages via GitHub Actions
