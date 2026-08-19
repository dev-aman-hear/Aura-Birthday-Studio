<div align="center">

# 🎂 Aura Birthday Studio
### *Craft Cinematic, Animated Celebration Stories & Interactive Wish Websites*

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/Vanilla_ES_Modules-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GSAP](https://img.shields.io/badge/Animations-GSAP_3.12-88CE02?style=for-the-badge&logo=greensock&logoColor=black)](https://greensock.com/gsap/)
[![IndexedDB](https://img.shields.io/badge/Storage-IndexedDB_Local-4B8BBE?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel_%2F_Netlify-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

<p align="center">
  <b>Aura Birthday Studio</b> is an all-in-one, zero-dependency web platform designed to create stunning, animated celebration websites and digital memory stories for <b>Birthdays, Weddings, Anniversaries, Graduations, Thanksgiving, Farewells, and Special Milestones</b> in minutes.
</p>

[✨ Live Features](#-key-features) • [🚀 Quick Start](#-quick-start) • [🎭 Scene Templates](#-scene-templates) • [🏗️ Architecture](#%EF%B8%8F-project-architecture) • [🚢 Deployment](#-deployment) • [📄 License](#-license)

---

</div>

## 🌟 Overview

**Aura Birthday Studio** transforms simple occasion wishes into an unforgettable multimedia experience. Whether you want to send a heartfelt birthday surprise, commemorate a wedding anniversary, or gather group wishes for a Thanksgiving dinner, Aura Studio equips creators with an intuitive design studio and provides recipients with a magical, interactive full-screen experience.

---

## ✨ Key Features

### 🎨 Multi-Occasion Theming & Presets
- **Ready-to-use Occasions**: Birthdays 🎂, Weddings 💍, Anniversaries ❤️, Graduations 🎓, Thanksgiving 🦃, Engagements 💎, Baby Showers 🍼, Farewells ✈️, Achievements 🏆, and Custom Events ✨.
- **Dynamic Visual Presets**: Curated gradients, festive color palettes, ambient lighting, and typography combinations tailored for every celebration.

### 🎬 Universal Scene Engine & Motion Graphics
- **Fluid Animation System**: Powered by **GSAP 3.12** for smooth transitions, parallax movement, animated text reveals, and camera-like flow effects.
- **Interactive Storytelling**: Recipients can swipe, click, or let the automated presentation take them through photo memories, messages, and surprise reveals.
- **Confetti & Particle FX**: Integrated celebratory bursts, floating balloons, glowing orbs, and sparkling particle physics.

### 💌 Live Interactive Wish Wall
- **Community Wishing**: Allows friends and family to submit personalized wishes, heartfelt notes, and emojis.
- **Real-Time Moderation**: Creator tools to review, approve, pin, and organize wishes in real time.
- **Reaction Emojis & Cards**: Dynamic masonry layout with interactive likes and celebratory reactions.

### ⏱️ Countdowns & Scheduled Surprises
- **Live Countdown Player**: Build anticipation with animated countdown timers ticking down to the celebration moment.
- **Pre-Reveal Mode**: Keep the surprise locked with teaser animations until the clock strikes twelve.

### 🖼️ Rich Media & Asset Library
- **Integrated Asset Manager**: Upload personal photos, videos, and music with automatic client-side caching.
- **Photo Cropping & Filtering**: In-browser adjustments, aspect ratio locking, and photo framing.
- **Stock Library Integration**: Unsplash imagery integration for instant backgrounds and thematic artwork.

### 🛡️ Privacy-First & Zero Server Setup
- **Local Persistence**: Powered by browser-native **IndexedDB** — projects and media are stored locally on your device with zero cloud tracking.
- **Draft Recovery & Autosave**: Auto-saves every edit with full undo/redo stacks and version history snapshots.
- **One-Click Sharing**: Export standalone, sharable recipient URLs or publish to static hosting instantly.

---

## 🎭 Scene Templates

Aura Birthday Studio includes versatile scene templates to craft your celebration narrative:

| Template | Icon | Description |
| :--- | :---: | :--- |
| **Hero Scene** | 🌟 | Impactful opening title with expressive date badges, typography, and background visuals. |
| **Reveal Scene** | 🎁 | Interactive "Tap to Open" surprise box with confetti explosion and heartfelt message. |
| **Photo Gallery** | 📸 | Responsive grid & carousel displays highlighting milestone photos and captions. |
| **Collage Scene** | 🖼️ | Artistic polaroid and multi-frame arrangements with tilt and floating animations. |
| **Timeline Story** | ⏳ | Chronological journey tracking memories, years together, and significant milestones. |
| **Message Card** | 💌 | Elegant typography card for long-form letters, quotes, and dedications. |
| **Wish Wall** | 💬 | Interactive community board with guest messages, stickers, and reactions. |
| **Video Player** | 🎥 | Seamless embedded video playback for video wishes and montage reels. |

---

## 🚀 Quick Start

Aura Birthday Studio is built with standard **ES Modules** and modern **Vanilla JavaScript**. No npm installs, Webpack, or heavy toolchains required.

### 1. Clone the Repository
```bash
git clone https://github.com/dev-aman-hear/Aura-Birthday-Studio.git
cd Aura-Birthday-Studio
```

### 2. Run Locally

#### Option A: Using the Built-in Python Server (Recommended)
```bash
python server.py
```
Open your browser and navigate to: **`http://localhost:8080`**

#### Option B: Using Node.js `npx serve` or `http-server`
```bash
npx serve .
```

#### Option C: Using VS Code Live Server
1. Install the **Live Server** extension in VS Code.
2. Right-click on `index.html` and select **"Open with Live Server"**.

---

## 🏗️ Project Architecture

```
Aura-Birthday-Studio/
├── index.html                  # Single-Page Application root entry point
├── server.py                   # Lightweight Python SPA local development server
├── vercel.json                 # Vercel SPA routing rewrite configuration
├── _redirects                  # Netlify SPA routing rules
├── sitemap.xml                 # Search engine sitemap
├── robots.txt                  # Search engine crawl rules
├── LICENSE                     # MIT License
├── README.md                   # Project documentation
│
└── src/
    ├── app.js                  # Application bootstrapper, routing & state controller
    │
    ├── animations/             # GSAP animation timeline definitions & particle engines
    │   ├── AnimationEngine.js
    │   ├── ParticleEffects.js
    │   └── SceneTransitions.js
    │
    ├── components/             # Reusable UI component elements
    │   ├── ExpressiveDateDisplay.js
    │   └── MediaViewerModal.js
    │
    ├── config/                 # App configuration, routing table, theme definitions
    │
    ├── css/                    # Modular Vanilla CSS design system
    │   ├── main.css            # Core variables, reset, and typography tokens
    │   ├── design-system.css   # Glassmorphic UI utilities, buttons, and form inputs
    │   ├── editor-modern.css   # Story editor canvas & layout styling
    │   ├── animations.css      # CSS keyframes & particle animations
    │   └── recipient.css       # Immersive recipient player styles
    │
    ├── data/                   # Default datasets, presets, and stock assets
    │   ├── Occasions.js        # Occasion metadata (Wedding, Birthday, Thanksgiving, etc.)
    │   ├── Relationships.js    # Relationship context presets
    │   └── SampleData.js       # Pre-populated celebration templates
    │
    ├── models/                 # Domain data models (Project, Scene, Wish, Asset)
    │
    ├── services/               # Core business logic & persistence layers
    │   ├── IndexedDBService.js # Offline-first browser storage engine
    │   ├── ProjectRepository.js# Project CRUD operations & versioning
    │   ├── WishRepository.js   # Community wish wall storage & moderation
    │   ├── AssetRepository.js  # Media uploads, caching, and blob management
    │   ├── CountdownService.js # Timezone-accurate celebration countdowns
    │   └── ShareService.js     # URL generation and publishing logic
    │
    ├── templates/              # Scene renderers and layout logic
    │   ├── UniversalSceneRenderer.js
    │   ├── HeroTemplate.js
    │   ├── RevealTemplate.js
    │   ├── CollageTemplate.js
    │   ├── TimelineTemplate.js
    │   └── WishWallSceneTemplate.js
    │
    ├── utils/                  # Color utilities, date formatters, and DOM helpers
    │
    └── views/                  # Screen views & modal controllers
        ├── DashboardView.js    # Creator workspace & celebration manager
        ├── CelebrationWizardView.js # Guided project creation workflow
        ├── UniversalSceneEditor.js  # Visual story editor & timeline
        ├── RecipientPlayerView.js   # Full-screen interactive viewer
        └── WishModerationView.js    # Live wish moderation panel
```

---

## ⌨️ Studio Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl / ⌘ + S` | Save current project draft |
| `Ctrl / ⌘ + Z` | Undo last action |
| `Ctrl / ⌘ + Y` / `Ctrl / ⌘ + Shift + Z` | Redo action |
| `Space` | Play / Pause story preview |
| `Left Arrow` / `Right Arrow` | Navigate to previous / next scene |
| `F` | Toggle recipient fullscreen playback |
| `Esc` | Close modal / Exit fullscreen |

---

## 🚢 Deployment

### Deploying to Vercel
The repository includes a ready-to-use `vercel.json` configuration for SPA rewrites:
1. Push your repository to GitHub.
2. Import the repo into [Vercel](https://vercel.com).
3. Set the Framework Preset to **Other** and Deploy.

### Deploying to Netlify
The repository includes `_redirects` for client-side routing fallback:
1. Connect your repository to [Netlify](https://netlify.com).
2. Set the Publish Directory to `.` (root) and deploy.

### Deploying to GitHub Pages
1. Go to repository **Settings** > **Pages**.
2. Under **Build and deployment**, select **Deploy from a branch** > `main` > `/ (root)`.
3. Click **Save**.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project (`https://github.com/dev-aman-hear/Aura-Birthday-Studio/fork`)
2. Create your feature branch (`git checkout -b feat/magical-new-feature`)
3. Commit your changes (`git commit -m "feat: add glowing fireworks effect"`)
4. Push to the branch (`git push origin feat/magical-new-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aman (dev-aman-hear)**
- GitHub: [@dev-aman-hear](https://github.com/dev-aman-hear)
- Email: [dev.aman.hear@gmail.com](mailto:dev.aman.hear@gmail.com)

<div align="center">
  <sub>Made with ❤️ and magical celebration vibes by Aman.</sub>
</div>
