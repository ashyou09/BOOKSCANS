# 📚 BookScan - Personal Reading Library & Tracker

![BookScan Hero](https://bookscans.vercel.app/icon.jpg)

**BookScan** is a custom, fully-responsive personal digital library application heavily inspired by the stunning reading atmosphere of premium scanlation sites like AsuraScans. It is built to seamlessly manage, read, and track your personal PDFs, manhwas, textbooks, and study materials with unmatched cloud synchronization.

## ✨ Features

- **📖 Custom PDF Reading Engine**: Optimized canvas rendering for both desktop and mobile devices. Read massive PDF volumes without your device breaking a sweat.
- **🌗 Immersive Reading Modes**: 
  - **Layouts**: Toggle between **Webtoon** (continuous vertical scrolling) and **Single Page** modes.
  - **Themes**: Switch between Midnight (Dark), Sepia (Warm), and Daylight (Light) to match your reading environment.
- **☁️ Cloud Synchronization**: Your bookmarks, chapter notes, and exact reading progress (down to the page) are synced flawlessly across your laptop, phone, and tablet via MongoDB. Pick up right where you left off.
- **🔥 Daily Streaks & Goals**: Keep yourself accountable! Set a daily page-reading goal, track your progress, and build your reading streak.
- **📝 Chapter Notes**: Take detailed study notes on specific chapters, securely stored in the cloud.
- **🎬 Video Study Resources**: Curate a list of related YouTube tutorials and video resources alongside your reading materials.
- **📱 Fully Responsive**: Custom mobile UI ensures reading on a tiny screen feels just as premium as on a monitor. Auto-hiding toolbars and optimized mobile touch controls.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **PDF Parsing**: `pdfjs-dist`
- **Icons**: `lucide-react`
- **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/ashyou09/BOOKSCANS.git
   cd BOOKSCANS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file in the root directory and add your MongoDB URI:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   ```

4. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🎨 Design Philosophy
The goal of BookScan is to escape the boring, sterile environment of traditional PDF readers. By implementing glassmorphism, dynamic glowing shadows, smooth micro-animations, and a curated dark mode palette, BookScan turns studying textbooks or reading manga into a premium, highly engaging experience.

---
*Built as a private personal library to conquer the 100 Days of ML and beyond!*
