# KCX Terminal: Interactive Portfolio

> [!TIP]
> **Live Site**: [plurino.github.io/kcxTerminal/](https://plurino.github.io/kcxTerminal/)

An immersive, terminal-themed portfolio built with **React** and **Tailwind CSS**. Designed by and for architects, builders, and tech leads.

## 🚀 Features
- **Boot Sequence**: Simulated kernel initialization for a high-tech first impression.
- **Interactive Terminal**: Custom command parser supporting `ls`, `cd`, `cat`, and more.
- **Dynamic Content**: Virtual file system with bio, skills, and project data.
- **SSH Simulation**: Realistic handshake animation for a "secure tunnel" vibe.
- **Network Pulse**: Integrated with `ipapi.co` to show real-time network and location status.
- **Matrix Mode**: Toggable canvas-based digital rain effect.

## 🛠️ Tech Stack
- **Framework**: [Vite](https://vitejs.dev/) + [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/icons)
- **Deployment**: [GitHub Pages](https://pages.github.com/) via GitHub Actions

---

## 🔍 Code Review & Analysis

### 1. Architecture
The project shifted from a single-file static HTML to a modern **Vite/React** architecture. This ensures high performance, smaller bundle sizes (via tree-shaking), and easier future maintenance.

### 2. State Management & Logic
- **Virtual File System**: The content is abstracted into a `FILE_SYSTEM` constant, making updates to professional details (bio, projects) simple without touching the terminal logic.
- **Immersive Hooks**: Extensive use of `useEffect` for handling sequential boot lines and terminal scrolling, resulting in a fluid, non-blocking user experience.
- **Simulated Networking**: The `ssh` command uses `setTimeout` to mimic high-latency handshakes, while the `pulse` command fetches real-world geolocation data to add a layer of realism.

### 3. UI/UX Strengths
- **Responsive Design**: The interface adapts to mobile and desktop, utilizing Tailwind's utility-first approach to maintain absolute terminal positioning across screen sizes.
- **Aesthetic Fidelity**: Custom animations (pulsing cursors, loading bars) and a dark slate/green palette provide a premium developer-centric aesthetic.

### 4. Recommendations for Scale
- **Componentization**: Split the massive `App` component into smaller, focused modules (`Terminal.jsx`, `MatrixGrid.jsx`, `SSHOverlay.jsx`).
- **Data Persistence**: Could implement `localStorage` to save user history between sessions.
- **Typed Access**: Moving to TypeScript would provide stronger guarantees for the dynamic `FILE_SYSTEM` lookups.

---

## 💻 Local Development
1. Clone the repo: `git clone https://github.com/plurino/kcxTerminal.git`
2. Install dependencies: `npm install`
3. Launch dev server: `npm run dev`
4. Build for production: `npm run build`
