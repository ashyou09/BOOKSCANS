# Implementation Plan: BookScans(AsuraScans-Inspired Reading Atmosphere)

Build **BookScans**, a high-performance web application based on [ReadTracker_ProjectPlan.md](file:///Users/ash/CascadeProjects/projects..../BOOKSCAN/ReadTracker_ProjectPlan.md), designed with an immersive **Reading Atmosphere** inspired by **AsuraScans**.

The app features dual **Dark Mode** (signature deep midnight fantasy theme with glowing violet/amber accents) and **Light Mode** (crisp reading light mode), alongside ambient reader lighting controls (Dark Midnight, Cozy Warm Sepia, Soft Paper, Charcoal Night).

---

## User Review Required

> [!IMPORTANT]
> **Zero-Setup Out-of-the-Box Experience**: The application will feature **BookScan** branding and ship with a dual-storage architecture:
>
> 1. **Client/Local Storage & IndexedDB PDF Engine** (Active immediately): Pre-populated with sample manhwa/books, chapter splits, study videos, and reading progress.
> 2. **AWS S3 + DynamoDB APIs**: Production API routes in `app/api/` ready for AWS integration whenever `.env.local` is provided.

> [!NOTE]
> Admin login credentials: `ashyou09` / `admin123`. Unauthenticated visitors enjoy a read-only guest experience.

---

## Key Design & Atmosphere Features

### 1. Branding & Immersive Atmosphere ("BookScans")

- **AsuraScans Brand Aesthetic**: Custom `BookScans` logo with glowing scanner/book icon, neon accents, dark mode default, and smooth light mode switch.
- **Ambient Reader Modes**:
  - 🌌 **Midnight Reading** (Asura Dark): Deep obsidian canvas `#0b0d14` with electric violet glow `#8b5cf6`.
  - 📜 **Cozy Sepia**: Warm paper texture with warm amber tones for late-night reading comfort.
  - 📄 **Soft Daylight** (Light Mode): Clean, non-glare white paper texture with crisp readability.
  - 🌙 **OLED Pure Black**: Ultra dark contrast for distraction-free reading.

### 2. Dashboard & Hero Carousel

- **Hero Carousel**: Featured titles, "Resume Reading" hero banner, daily goal ring, and streak counter.
- **BookScan Popular & Recent Releases Grid**: Cards with cover zoom effect, status badges (*HOT*, *NEW*, *ONGOING*, *COMPLETED*), rating stars, latest chapter pill, and bookmark toggle.

### 3. PDF & Manhwa Reader Engine (`/read/[bookId]`)

- **Dual Layout Modes**: Continuous Vertical Scroll (Webtoon format) vs Single Page Flip.
- **Reader Controls**: Chapter selector dropdown, next/prev chapter, jump-to-page slider, page zoom, ambient theme selector, and fullscreen toggle.

### 4. Library & Upload Hub (`/library`)

- Category filters (Manga/Manhwa, Novels, Textbooks, Study Notes, Bookmarks).
- **BookScan Drag-and-Drop PDF Uploader**: Admin modal for uploading PDFs, setting custom `pagesPerChapter`, assigning tags, and generating chapter maps.

### 5. Video Study Resources (`/videos`)

- Cards for YouTube tutorials/study videos (ML, Math, Computer Science, General).
- In-app modal player, completion toggles, and per-video study notes.

---

## Proposed Changes

### Project Setup & Configuration

#### [NEW] [package.json](file:///Users/ash/CascadeProjects/projects..../BOOKSCAN/package.json)

Next.js 14, React 18, Tailwind CSS, Lucide Icons, Framer Motion, Zustand state management, NextAuth, AWS SDK packages.

#### [NEW] [tailwind.config.js](file:///Users/ash/CascadeProjects/projects..../BOOKSCAN/tailwind.config.js)

Color palette for BookScan (obsidian dark `#0b0d14`, card dark `#121520`, electric violet `#8b5cf6`, cyan `#06b6d4`, warm sepia `#fbf0d9`).

#### [NEW] [app/globals.css](file:///Users/ash/CascadeProjects/projects..../BOOKSCAN/app/globals.css)

Theme CSS variables, custom scrollbars, webtoon reader layouts, ambient glow utilities.

---

### App & Components Structure

- `types/index.ts`: Types for Book, Chapter, Progress, Video, Goal.
- `lib/chapters.ts`: Chapter auto-calculation logic.
- `lib/store.ts`: Zustand store for state & local storage persistence.
- `lib/mockData.ts`: Preloaded sample library for instant out-of-the-box demo.
- `components/Header.tsx`: BookScan top nav with search, theme toggle, daily goal badge, admin lock.
- `components/HeroBanner.tsx`: AsuraScans-style featured banner & continue reading card.
- `components/BookCard.tsx`: Interactive book card with hover effects, rating stars, and chapter updates.
- `components/PDFReader.tsx`: PDF viewer with webtoon scroll & single page options.
- `components/ChapterList.tsx`: Sidebar/drawer chapter list.
- `components/GoalTracker.tsx`: Daily reading target widget with streak stats.
- `components/UploadModal.tsx`: PDF upload & chapter split dialog.
- `components/VideoCard.tsx`: Video resource card with embedded player modal.
- `components/AdminModal.tsx`: Admin login dialog (`ashyou09`).
- `app/page.tsx`: Home dashboard.
- `app/library/page.tsx`: Library page.
- `app/read/[bookId]/page.tsx`: Fullscreen reader page.
- `app/videos/page.tsx`: Video tracker page.
- `app/api/...`: AWS S3 & DynamoDB API endpoints.

---

## Verification Plan

### Automated Tests

- `npm run build` to verify code compiles cleanly without errors.

### Manual Verification

- Test BookScan dark and light themes + ambient reader lighting.
- Test PDF reading with chapter navigation and progress saving.
- Test PDF upload with custom chapter splitting.
- Test video study tracker, goal tracker, and admin auth lock.
