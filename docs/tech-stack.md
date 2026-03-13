# Technology Stack: Antigravity

This document tracks all primary technologies and dependencies used in the Antigravity platform.

## Frontend `/frontend`
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (for floating UI and glassmorphism dynamics)
- **Charting**: Lightweight Charts (for real-time stock rendering)
- **UI Theme**: Deep Space Black, Neon Cyan, Glassmorphism. Neon Green/Red candlesticks.

## Backend `/backend`
- **Runtime**: Node.js
- **Server**: Express.js
- **Real-time Engine**: Socket.io (for Multiplayer Rooms & Live Leaderboards)

## Database & Auth
- **Provider**: Firebase
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore

### Firestore Schema Details
- `users`: `uid`, `email`, `displayName`, `walletBalance` (Number), `badges` (Array of Strings)
- `portfolios`: `userId`, `stockSymbol`, `buyPrice`, `quantity`, `timestamp`
- `rooms`: `roomId`, `hostId`, `participants` (Array of userIds), `leaderboardSnapshot` (Map of user P&Ls)

## External APIs
- **Market Data**: Finnhub API or Alpha Vantage API 
- **News Feed**: NewsAPI
- **AI Engine**: Google Gemini API (for Sentiment Analysis & Case Studies)
