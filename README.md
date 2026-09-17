# ⚡ Synapse MCQ Studio

> **Ultra-Low-RAM, Cross-Platform Desktop Platform for AI-Powered PDF Multiple Choice Question Learning**

Built with **Rust + Tauri v2 + React 19 + Tailwind CSS**, Synapse MCQ Studio delivers an end-to-end workflow: configuring and generating customized AI prompts for Antigravity with your PDFs, validating and ingesting the resulting JSON/CSV question sets, and practicing or taking exams inside a revolutionary **Obsidian-Spatial HUD**.

---

## 📥 Cross-Platform Binary Downloads

Download the latest pre-compiled binaries from [GitHub Releases](https://github.com/manuja-me/synapse-mcq-desktop/releases):

| Operating System | Package Type | Download / Install |
| :--- | :--- | :--- |
| **Windows** (10/11) | Portable `.zip` / `.exe` | Download `Synapse-MCQ-Studio-v0.1.2-windows-x64.zip` or run `launch.bat` |
| **macOS** (Apple Silicon & Intel) | `.dmg` Installer | Download `Synapse-MCQ-Studio-0.1.2_aarch64.dmg` or `_x64.dmg` |
| **Arch Linux** | Native `.pkg.tar.zst` | `sudo pacman -U synapse-mcq-desktop-0.1.2-1-x86_64.pkg.tar.zst` |
| **Ubuntu / Debian** | `.deb` Package | `sudo dpkg -i synapse-mcq-studio_*_amd64.deb` |

---

## 🚀 Key Features

### 1. 🎛️ AI Prompt Studio (Unified Prompt Generator)
- **Interactive Form with Dropdowns**:
  - **Question Count**: 5, 10, 15, 20, 30, 50 questions (or custom).
  - **Difficulty Distribution**: Balanced, Easy, Medium, Hard, Progressive Adaptive.
  - **Question Archetype**: Conceptual & Theory, Practical / Application, Case Study & Scenario, High-Yield Board Exam, Edge Cases & Trick Questions.
  - **Target Academic / Professional Level**: High School, Undergraduate, Graduate / Postgrad, Professional Certification, Corporate Training.
  - **Explanation Depth**: Didactic (every option analyzed), Concise Rationale, Key Takeaway Only.
  - **Language & Custom Directives**: Custom instructions for specific chapters, formulas, or focus areas.
- **Dynamic Prompt Synthesizer**: Compiles user selections into a prompt enforcing the exact JSON schema.
- **One-Click Copy**: Copy prompt directly to clipboard and paste it into Antigravity alongside your PDF.

### 2. 🛡️ Ingestion Shield & Question Bank
- **Multi-Input**: Drag-and-drop `.json` / `.csv` files or paste raw JSON directly into the editor.
- **Real-Time Schema Validation**: Fast Rust-powered validation (`parse_and_validate_deck`) checking question stems, option bounds, and answer indices.
- **Deck Metrics**: Instant preview of question counts, detected topics, difficulty distribution, and estimated test duration.
- **Question Bank**: Manage multiple quiz sets, search by topic/keyword, filter by difficulty, and export decks.

### 3. 🧠 Precision Minimalist HUD & Pointed Geometry
- **Pointed Industrial Aesthetic**: Strict geometric pointed corners (`rounded-none`), zero-radius panels, clean hair-thin borders (`#27272A`), and an understated dark zinc + precision emerald palette.
- **Native Frameless Titlebar Controls**: Dedicated Minimize (`_`), Maximize (`□`), and Close (`✕`) buttons with native OS-level IPC handlers that work reliably without dragging interference.
- **Zen Practice Mode**:
  - Instant tactile feedback when clicking an option.
  - Animated Didactic Distractor Analysis: reveals why the chosen option is right AND explains why each distractor is incorrect.
- **Simulated Exam Mode**:
  - Countdown timer with visual alerts when time is low.
  - Square Question Navigation Matrix Grid (Answered, Flagged, Unvisited).
  - Answers locked until final submit with confirmation modal.
- **KaTeX LaTeX Math Rendering**: Renders mathematical equations ($O(N \log N)$, $\sum_{i=1}^n$, formulas) cleanly.
- **Cognitive Diagnostic Dashboard**: Mastery rating, topic-by-topic breakdown bars, and missed question review.

---

## ⚡ Ultra-Low-RAM Engineering

The software is specifically engineered to **aggressively reduce RAM usage** while leveraging GPU hardware acceleration:
- **Rust Native Core**: Memory footprint of the compiled backend is only ~3–5 MB.
- **Native OS WebView2 / WebKit**: Taps into the operating system's built-in webview (Edge WebView2 on Windows, WebKit on macOS, WebKitGTK on Linux), eliminating bundled Chromium bloat.
- **Active Working-Set Trimming**: Includes a dedicated Win32 memory-flushing hook (`SetProcessWorkingSetSize` / `EmptyWorkingSet`) that flushes inactive pages to keep active working set hovering at ~35 MB.
- **GPU Offloading**: Glassmorphism blur filters and neon border effects are rendered on GPU shaders without eating system RAM.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Open Universal Command Palette |
| `1`, `2`, `3`, `4` or `A`, `B`, `C`, `D` | Select Option A, B, C, or D |
| `Left Arrow` / `Right Arrow` | Previous / Next Question |
| `F` | Toggle Flag for Review |
| `Esc` | Close Modals / Command Palette |

---

## 🏃 Building Locally from Source

```bash
# Clone the repository
git clone https://github.com/manuja-me/synapse-mcq-desktop.git
cd synapse-mcq-desktop

# Install frontend dependencies
bun install

# Run in Development Mode
bun run tauri dev

# Build Native Binary
bun run build
cd src-tauri && cargo build --release
```

---

## 📄 License
MIT License. Created for frictionless AI-powered study workflows.
