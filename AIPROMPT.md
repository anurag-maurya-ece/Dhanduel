# Dhan Duel - Project AI Prompt & Setup Guide

This file contains all the necessary context about the "Dhan Duel" project. You can copy-paste this file into any AI assistant or IDE to quickly get it up to speed.

## Project Overview
**Dhan Duel** is a gamified, real-time stock market education platform built to let users practice trading without financial risk. It supports both Solo play and a real-time Multiplayer Arena.

## Tech Stack
-   **Frontend Framework**: Next.js 14 (App Router) with React 18, TypeScript, Tailwind CSS
-   **Animations & Charts**: Framer Motion, Lightweight Charts
-   **Backend & DB**: Firebase (Authentication, Firestore Database for persistent accounts and history)
-   **Real-time Comm**: Socket.IO, Express server (Node.js) for Multiplayer Lobby
-   **Styling**: Modern, glowing animations, comprehensive Light/Dark mode via `next-themes`.

## Folder Structure
```
d:\hack4impact\
├── frontend/
│   ├── src/
│   │   ├── app/ (Next.js Pages: page.tsx, login/page.tsx, solo/page.tsx, multiplayer/page.tsx)
│   │   ├── components/ (UI: SoloDashboard, ArenaTradePanel, MultiplayerLobby, Navbar, MyStocks)
│   │   ├── lib/ (API config, Firestore helpers, Auth Context, Socket client)
│   │   ├── directives/ (Firebase db export configuration)
│   │   └── ... globals.css
│   ├── .env.local (Firebase API keys and Next.js settings)
│   └── package.json
└── backend/
    ├── server.js (Socket.IO Express server for multiplayer rooms and leaderboards)
    ├── .env
    └── package.json
```

## Running Locally

1. **Start the Backend server:**
   ```bash
   cd backend
   npm run dev  # or `node server.js` - runs on port 5000
   ```
2. **Start the Frontend development server:**
   ```bash
   cd frontend
   npm run dev  # runs on port 3000
   ```
3. Open `http://localhost:3000` to interact with the app.

## Implemented Features
- Real-time stock data fetching (via proxy/API).
- Persistent Firebase Authentication (Login/Register via email/pass).
- Persistent user state (Wallet Balance, Shares, History) across sessions using Firestore.
- Multiplayer Rooms with Socket.IO synchronized leaderboards and localized Chat.
- Light and Dark Mode toggle.
