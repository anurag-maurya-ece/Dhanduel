# Dhan Duel — Complete Project AI Prompt

> A gamified stock market educational platform where users learn trading through real-time simulations, AI-powered analysis, multiplayer competitions, and case study walkthroughs.

---

## Project Overview

**Dhan Duel** is a full-stack web application that gamifies stock market learning. Users can trade virtual stocks with real-time market data, compete in multiplayer arenas, read AI-analyzed news, and solve financial case studies — all within a visually premium dark-mode UI.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 16.1.6 (App Router, Turbopack)
- **Language:** TypeScript + React 19
- **Styling:** Tailwind CSS 4 (dark mode, glassmorphism, gradients, animations)
- **Charts:** TradingView's `lightweight-charts` v5
- **Animations:** Framer Motion
- **Icons:** lucide-react
- **State:** React useState/useContext + Zustand
- **Realtime:** socket.io-client
- **Auth & DB:** Firebase SDK v12 (Auth + Firestore)

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Realtime:** Socket.IO 4 (rooms, chat, leaderboard broadcasting)
- **Auth:** Firebase Admin SDK
- **Type:** CommonJS

### Firebase
- **Authentication:** Email/Password + Anonymous
- **Database:** Cloud Firestore (user profiles, trade history, scores, room history, chat, holdings)
- **Project ID:** `antigravity-game-1289`

### External APIs
- **Market Data:** Yahoo Finance v8 API (via Next.js API route proxy)
- **Forex Rates:** Yahoo Finance forex endpoint (USD/INR)
- **AI Analysis:** Google Gemini API (via Next.js API route)

---

## Project Structure

```
hack4impact/
├── firebase.json              # Firebase config (Firestore + Auth)
├── firestore.rules            # Security rules (open for dev)
├── firestore.indexes.json     # Composite indexes
│
├── frontend/                  # Next.js App
│   ├── package.json
│   ├── .env.local             # Firebase keys + Gemini API key
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx         # Root layout with AuthProvider, Navbar
│   │   │   ├── page.tsx           # Homepage (hero, features, CTA)
│   │   │   ├── globals.css        # Tailwind + custom glass-panel styles
│   │   │   ├── login/page.tsx     # Login & Registration page
│   │   │   ├── solo/page.tsx      # Solo trading (AuthGuard protected)
│   │   │   ├── multiplayer/page.tsx # Arena lobby (AuthGuard protected)
│   │   │   ├── news/page.tsx      # AI news feed (AuthGuard protected)
│   │   │   ├── casestudies/page.tsx # Case studies (AuthGuard protected)
│   │   │   └── api/
│   │   │       ├── market/[symbol]/route.ts  # Yahoo Finance proxy
│   │   │       ├── forex/route.ts            # USD/INR rate
│   │   │       └── ai/analyze/route.ts       # Gemini AI analysis
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.tsx         # Glowing bottom navigation (6 tabs)
│   │   │   ├── SoloDashboard.tsx  # Full solo trading: chart, wallet, buy/sell, holdings
│   │   │   ├── ArenaTradePanel.tsx # Arena trading: chart, buy/sell, P&L broadcast
│   │   │   ├── MultiplayerLobby.tsx # Room create/join, chat, leaderboard, history
│   │   │   ├── MyStocks.tsx       # Reusable portfolio holdings display
│   │   │   ├── AuthGuard.tsx      # Route protection (redirect to /login)
│   │   │   ├── NewsSentimentFeed.tsx # AI-analyzed news cards
│   │   │   └── CaseStudyModal.tsx # Interactive case study UI
│   │   │
│   │   ├── lib/
│   │   │   ├── AuthContext.tsx    # Firebase Auth provider (login/register/logout)
│   │   │   ├── firestoreService.ts # All Firestore CRUD (users, trades, rooms, chat, holdings)
│   │   │   ├── marketApi.ts       # Yahoo Finance data fetcher
│   │   │   ├── newsApi.ts         # News API integration
│   │   │   ├── socketClient.ts    # Socket.IO client singleton
│   │   │   ├── caseStudies.ts     # Case study scenarios data
│   │   │   └── simulationStore.ts # Zustand store for simulation state
│   │   │
│   │   └── directives/
│   │       └── firebaseClient.js  # Firebase client initialization
│
└── backend/                   # Express + Socket.IO server
    ├── package.json
    ├── server.js              # Entry point (Express + Socket.IO)
    └── src/orchestration/
        ├── routes.js          # REST API routes
        └── sockets.js         # Socket events (rooms, chat, leaderboard)
```

---

## Firestore Data Model

```
users/{uid}
  ├── email, displayName, walletBalance, totalPnL, totalTrades, createdAt
  ├── trades/{tradeId}         → { symbol, action, quantity, price, currency, timestamp }
  ├── scores/{scenarioId}      → { action, correct, points, timestamp }
  └── holdings/{mode}          → { holdings: {symbol: {shares, totalCost}}, wallet, updatedAt }
       mode = "solo" or roomId

rooms/{roomId}
  ├── roomId, createdBy, createdAt, status, players[], finalLeaderboard
  ├── chat/{msgId}             → { userId, message, isSystem, timestamp }
  └── leaderboard/latest       → { rankings: {userId: pnl}, updatedAt }
```

---

## Environment Variables

Create `frontend/.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<project>.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<project>.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<app-id>

# Server-side only
GEMINI_API_KEY=<your-gemini-api-key>
```

---

## Setup & Run Instructions

### Prerequisites
- Node.js v20+ installed
- Firebase project with Email/Password auth enabled
- (Optional) Gemini API key from ai.google.dev

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. Configure Firebase
1. Create a Firebase project at console.firebase.google.com
2. Enable **Email/Password** authentication under Authentication > Sign-in method
3. Create a **Firestore Database** (start in test mode)
4. Register a **Web App** and copy the config to `frontend/.env.local`

### 3. Run Both Servers

**Terminal 1 — Backend (Socket.IO):**
```bash
cd backend
node server.js
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend (Next.js):**
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

### 4. Open in Browser
Navigate to `http://localhost:3000` → Register → Start trading!

---

## Core Features

### 1. Authentication (Firebase Auth)
- Email/Password registration & login
- AuthGuard HOC protects Solo, Arena, News, Case Studies pages
- User profile stored in Firestore with wallet balance

### 2. Solo Trading
- Real-time candlestick charts (Yahoo Finance, 15s refresh)
- 10 stocks: Apple, Tesla, NVIDIA, Microsoft, Google, Bitcoin, Nifty 50, Reliance, TCS, Infosys
- USD/INR currency toggle with live forex rate
- Buy/Sell with virtual $10,000 wallet
- **My Stocks** section showing all holdings with per-stock P&L
- Holdings persist to Firestore (survive logout/login)
- Trade history saved to Firestore

### 3. Multiplayer Arena
- Create/Join rooms with 6-digit codes
- **3-column layout:** Rankings | Live Trading | Room Chat
- Real-time P&L leaderboard (Socket.IO broadcast)
- Live chat with system messages (join/leave)
- Room history saved to Firestore (chat + leaderboard)
- Leave button with final leaderboard snapshot
- **Recent Rooms** section in lobby

### 4. AI News Feed
- Financial news with AI sentiment analysis (Gemini API)
- Color-coded sentiment badges (Bullish/Bearish/Neutral)
- AI-generated actionable insights per article

### 5. Case Studies
- Interactive financial scenarios with decision points
- AI-powered analysis of user choices
- Score tracking per scenario

### 6. Navigation
- Glowing bottom navbar with 6 tabs: Home, Trade, Arena, News, Cases, Logout
- Active tab highlighting with gradient glow effect
- User greeting in navbar when logged in

---

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join-room` | `{roomId, userId}` | Join a trading room |
| `leave-room` | `{roomId, userId}` | Leave a trading room |
| `update-leaderboard` | `{roomId, userId, pnl}` | Update P&L on leaderboard |
| `chat-message` | `{roomId, userId, message}` | Send chat message |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `user-joined` | `{userId}` | Someone joined the room |
| `leaderboard-updated` | `{userId: pnl, ...}` | Full leaderboard state |
| `chat-message` | `{userId, message, timestamp, isSystem}` | Chat message broadcast |

---

## Design System

- **Color Palette:** Dark mode base `#0A0B10`, cyan-400 accents, purple-500 CTAs, green/red for P&L
- **Glass Panels:** `bg-white/[0.02] backdrop-blur-xl border border-white/10`
- **Typography:** System font stack with mono for numbers
- **Animations:** Framer Motion for page transitions, hover effects, micro-interactions
- **Responsive:** Mobile-first with lg: breakpoints for desktop layouts
