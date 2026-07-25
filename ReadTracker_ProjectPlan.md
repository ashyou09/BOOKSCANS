# ReadTracker — Personal PDF & Video Reading App
## Complete Project Plan

---

## 1. What You're Building

A private personal web app (like a mini manga/novel reader for yourself) where you can:
- Upload any PDF book/novel
- Auto-split it into chapters by page count you define
- Read page by page with auto-resume
- Set daily reading goals
- Add YouTube / video links as study resources
- Bookmark favourites for quick access

Only **you** can add/edit anything (admin login). Anyone else who visits can only view.

---

## 2. Tech Stack

### Frontend
| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14** (React) | Free hosting on Vercel, file-based routing, great PDF support |
| Styling | **Tailwind CSS** | Fast, clean, no extra CSS files |
| PDF Viewer | **react-pdf** | Renders PDFs page by page in browser |
| State | **Zustand** | Simple global state for reading progress |

### Backend / API
| Layer | Choice | Why |
|---|---|---|
| API Routes | **Next.js API Routes** | Same project, no separate server needed |
| Auth | **NextAuth.js** | Simple admin-only login, free |
| Database | **Amazon DynamoDB** | 25 GB free tier — perfect |
| File Storage | **AWS S3** (free tier: 5 GB) | Store PDF files |
| AWS SDK | **@aws-sdk/client-dynamodb** | Official AWS SDK |

### Hosting
| Service | Cost |
|---|---|
| **Vercel** (app) | Free |
| **AWS Free Tier** (DynamoDB + S3) | Free up to limits |

---

## 3. DynamoDB Schema

DynamoDB is a NoSQL key-value store. Everything goes into **one or two tables**.

### Table 1: `Books`

Stores every book/PDF you upload.

```
PK (Partition Key): BOOK#<bookId>      e.g. BOOK#abc123
SK (Sort Key):      METADATA

Attributes:
  bookId        String    "abc123"
  title         String    "Attack on Titan Vol 1"
  totalPages    Number    200
  pagesPerChapter Number  10
  totalChapters Number    20  (auto-calculated: totalPages / pagesPerChapter)
  s3Key         String    "pdfs/abc123.pdf"   (path in S3)
  uploadedAt    String    ISO date
  isBookmarked  Boolean   true / false
  coverImage    String    (optional S3 key for thumbnail)
```

### Table 2: `Progress`

Tracks your reading position for each book.

```
PK: USER#admin
SK: BOOK#<bookId>

Attributes:
  currentPage      Number    14
  currentChapter   Number    2
  lastReadAt       String    ISO date
  totalPagesReadToday Number  8
  dailyGoal        Number    5
  goalReachedToday Boolean   false
  sessionDate      String    "2025-07-25"  (resets daily)
```

### Table 3: `Videos`

Stores your video links.

```
PK: VIDEO#<videoId>
SK: METADATA

Attributes:
  videoId      String    "vid001"
  title        String    "ML Chapter 1"
  url          String    "https://youtube.com/..."
  category     String    "ML" / "Math" / "General"
  isWatched    Boolean   false
  addedAt      String    ISO date
  notes        String    (optional notes)
```

### Single Table Design (Advanced Option)

You can also use just **one table** called `ReadTracker`:

```
PK              SK                    Item Type
USER#admin      BOOK#abc123           Progress record
BOOK#abc123     METADATA              Book details
VIDEO#vid001    METADATA              Video record
```

This is more efficient but the 3-table approach is easier to start with.

---

## 4. Folder Structure

```
readtracker/
├── app/                          # Next.js App Router
│   ├── (auth)/
│   │   └── login/page.tsx        # Login page
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Main layout with sidebar
│   │   ├── page.tsx              # Home / dashboard
│   │   ├── library/page.tsx      # All PDFs (bookmarked)
│   │   ├── read/[bookId]/page.tsx # PDF reader
│   │   └── videos/page.tsx       # Video tracker
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── books/
│       │   ├── route.ts          # GET all, POST new book
│       │   └── [bookId]/route.ts # GET, PUT, DELETE single book
│       ├── progress/
│       │   └── [bookId]/route.ts # GET & PUT reading progress
│       ├── upload/route.ts       # PDF upload to S3
│       └── videos/
│           ├── route.ts          # GET all, POST new video
│           └── [videoId]/route.ts
├── components/
│   ├── PDFReader.tsx             # The PDF reading component
│   ├── ChapterList.tsx           # Chapter navigation sidebar
│   ├── ProgressBar.tsx           # Reading progress bar
│   ├── GoalTracker.tsx           # Daily goal display
│   ├── BookCard.tsx              # Book card for library
│   ├── VideoCard.tsx             # Video link card
│   └── Navigation.tsx            # Main navigation
├── lib/
│   ├── dynamo.ts                 # DynamoDB client setup
│   ├── s3.ts                     # S3 client setup
│   ├── auth.ts                   # NextAuth config
│   └── chapters.ts               # Chapter calculation logic
├── types/
│   └── index.ts                  # TypeScript types
├── .env.local                    # Secret keys (NEVER commit this)
└── package.json
```

---

## 5. Step-by-Step Build Plan

### Phase 1: Setup (Day 1-2)
1. Create Next.js project: `npx create-next-app@latest readtracker`
2. Install packages (see Section 7)
3. Set up AWS account, create DynamoDB tables and S3 bucket
4. Configure `.env.local` with AWS keys
5. Set up NextAuth with admin credentials (hashed)

### Phase 2: Book Upload & Storage (Day 3-4)
1. Build the upload API route — receives PDF, sends to S3, saves metadata to DynamoDB
2. Build the Library page showing all books
3. Add bookmark toggle

### Phase 3: PDF Reader (Day 5-6)
1. Build `PDFReader.tsx` using `react-pdf`
2. Implement chapter calculation from `pagesPerChapter` setting
3. Add page navigation (prev/next)
4. Save progress to DynamoDB every time page changes

### Phase 4: Progress & Goals (Day 7)
1. Build `GoalTracker.tsx` — shows today's pages read vs goal
2. Auto-reset daily counter at midnight (check `sessionDate`)
3. Add "Continue Reading" button that loads last saved page

### Phase 5: Video Tracker (Day 8)
1. Build add-video form (title + URL + category)
2. Video card grid with watch/unwatch toggle
3. Click to open video in new tab

### Phase 6: Polish & Deploy (Day 9-10)
1. Make it mobile-friendly
2. Deploy to Vercel (free)
3. Test admin login works, public can only view

---

## 6. Core Logic: Chapter Generation

```typescript
// lib/chapters.ts

export interface Chapter {
  chapterNumber: number;
  startPage: number;
  endPage: number;
  totalPages: number;
}

export function generateChapters(
  totalPages: number,
  pagesPerChapter: number
): Chapter[] {
  const chapters: Chapter[] = [];
  let currentPage = 1;
  let chapterNumber = 1;

  while (currentPage <= totalPages) {
    const endPage = Math.min(currentPage + pagesPerChapter - 1, totalPages);
    chapters.push({
      chapterNumber,
      startPage: currentPage,
      endPage,
      totalPages: endPage - currentPage + 1,
    });
    currentPage = endPage + 1;
    chapterNumber++;
  }

  return chapters;
}

// Example: 100 pages, 10 per chapter
// Chapter 1: pages 1-10
// Chapter 2: pages 11-20
// ...
// Chapter 10: pages 91-100

export function getChapterForPage(
  page: number,
  pagesPerChapter: number
): number {
  return Math.ceil(page / pagesPerChapter);
}

export function getStartPageOfChapter(
  chapterNumber: number,
  pagesPerChapter: number
): number {
  return (chapterNumber - 1) * pagesPerChapter + 1;
}
```

---

## 7. Auth Setup (Admin-Only Lock)

**IMPORTANT:** Never store passwords in plain text. Use NextAuth with a credentials provider.

```typescript
// lib/auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Store this hash in your .env.local, NOT the plain password
// Generate hash: node -e "const b=require('bcryptjs'); console.log(b.hashSync('YourPassword', 10))"
const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH!;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const isValidUser = credentials.username === ADMIN_USERNAME;
        const isValidPass = await bcrypt.compare(
          credentials.password,
          ADMIN_PASSWORD_HASH
        );

        if (isValidUser && isValidPass) {
          return { id: "admin", name: "Admin", role: "admin" };
        }
        return null;
      },
    }),
  ],
  session: { strategy: "jwt" as const },
  pages: { signIn: "/login" },
};

export default NextAuth(authOptions);
```

Your `.env.local` file:
```
ADMIN_USERNAME=ashyou09
ADMIN_PASSWORD_HASH=$2a$10$...  (bcrypt hash of your password)
NEXTAUTH_SECRET=some-random-long-string-here
NEXTAUTH_URL=http://localhost:3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
S3_BUCKET_NAME=readtracker-pdfs
```

---

## 8. DynamoDB Client Setup

```typescript
// lib/dynamo.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const dynamo = DynamoDBDocumentClient.from(client);
```

---

## 9. Key API Routes

### Save Reading Progress
```typescript
// app/api/progress/[bookId]/route.ts
import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamo } from "@/lib/dynamo";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: { bookId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { currentPage, currentChapter, dailyGoal } = await req.json();
  const today = new Date().toISOString().split("T")[0];

  // Get existing progress to track daily pages
  const existing = await dynamo.send(
    new GetCommand({
      TableName: "Progress",
      Key: { PK: "USER#admin", SK: `BOOK#${params.bookId}` },
    })
  );

  const prev = existing.Item;
  const isNewDay = prev?.sessionDate !== today;
  const pagesReadToday = isNewDay
    ? 1
    : (prev?.totalPagesReadToday || 0) + 1;

  await dynamo.send(
    new PutCommand({
      TableName: "Progress",
      Item: {
        PK: "USER#admin",
        SK: `BOOK#${params.bookId}`,
        currentPage,
        currentChapter,
        lastReadAt: new Date().toISOString(),
        totalPagesReadToday: pagesReadToday,
        dailyGoal: dailyGoal || prev?.dailyGoal || 10,
        goalReachedToday: pagesReadToday >= (dailyGoal || prev?.dailyGoal || 10),
        sessionDate: today,
      },
    })
  );

  return Response.json({
    success: true,
    pagesReadToday,
    goalReached: pagesReadToday >= (dailyGoal || 10),
  });
}
```

---

## 10. Packages to Install

```bash
npm install next-auth bcryptjs react-pdf zustand
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
npm install @types/bcryptjs
npm install tailwindcss
```

---

## 11. AWS Free Tier Limits (Safe for Personal Use)

| Service | Free Limit | Your Usage |
|---|---|---|
| DynamoDB | 25 GB storage, 25 RCU/WCU | Well under for 1 user |
| S3 | 5 GB storage, 20K GET, 2K PUT | ~50 PDFs easily |
| Lambda (if needed) | 1M requests/month | Not needed for Next.js |
| Vercel | 100 GB bandwidth | Free hobby plan |

**Cost: $0** for personal use at this scale.

---

## 12. Security Checklist

- [ ] Password stored as bcrypt hash (never plain text)
- [ ] `.env.local` added to `.gitignore`
- [ ] AWS IAM user created with minimum permissions (only DynamoDB + S3 access)
- [ ] All write APIs check `getServerSession()` before executing
- [ ] Public read routes don't expose admin session info
- [ ] S3 bucket set to private (access only via pre-signed URLs)

---

## Summary

You're building a **Next.js app** hosted free on **Vercel**, with data in **AWS DynamoDB** and PDFs in **AWS S3** — all within the free tier. The admin lock means only you can add/edit books and videos. Anyone else who visits can see but not change anything.

Build it phase by phase — start with upload + reader, then add progress tracking, then videos.
