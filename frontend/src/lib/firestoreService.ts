import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  Firestore
} from "firebase/firestore";
import { db as untypedDb } from "@/directives/firebaseClient";

const db = untypedDb as Firestore;

// ── User Profile ──────────────────────────────────────────────

export async function createUserProfile(uid: string, email: string, displayName: string) {
  await setDoc(doc(db, "users", uid), {
    email,
    displayName,
    walletBalance: 10000,
    totalPnL: 0,
    totalTrades: 0,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserPortfolio(
  uid: string,
  walletBalance: number,
  totalPnL: number,
  totalTrades: number
) {
  await updateDoc(doc(db, "users", uid), {
    walletBalance,
    totalPnL,
    totalTrades,
  });
}

// ── Stock Holdings Persistence ────────────────────────────────

export async function saveHoldings(
  uid: string,
  holdings: Record<string, { shares: number; totalCost: number }>,
  wallet: number,
  mode: "solo" | string = "solo" // "solo" or roomId
) {
  await setDoc(doc(db, "users", uid, "holdings", mode), {
    holdings,
    wallet,
    updatedAt: serverTimestamp(),
  });
}

export async function getHoldings(uid: string, mode: "solo" | string = "solo") {
  const snap = await getDoc(doc(db, "users", uid, "holdings", mode));
  if (snap.exists()) {
    const data = snap.data();
    return {
      holdings: (data.holdings || {}) as Record<string, { shares: number; totalCost: number }>,
      wallet: (data.wallet ?? 10000) as number,
    };
  }
  return null;
}

// ── Trade History ─────────────────────────────────────────────

export interface TradeRecord {
  symbol: string;
  action: "buy" | "sell";
  quantity: number;
  price: number;
  currency: string;
  timestamp?: ReturnType<typeof serverTimestamp>;
}

export async function saveTrade(uid: string, trade: TradeRecord) {
  await addDoc(collection(db, "users", uid, "trades"), {
    ...trade,
    timestamp: serverTimestamp(),
  });
}

export async function getTradeHistory(uid: string, count = 20) {
  const q = query(
    collection(db, "users", uid, "trades"),
    orderBy("timestamp", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── Case Study Scores ─────────────────────────────────────────

export async function saveScore(
  uid: string,
  scenarioId: string,
  action: string,
  correct: boolean,
  points: number
) {
  await setDoc(doc(db, "users", uid, "scores", scenarioId), {
    action,
    correct,
    points,
    timestamp: serverTimestamp(),
  });
}

export async function getScores(uid: string) {
  const snap = await getDocs(collection(db, "users", uid, "scores"));
  const scores: Record<string, { action: string; correct: boolean; points: number }> = {};
  snap.docs.forEach((d) => {
    scores[d.id] = d.data() as { action: string; correct: boolean; points: number };
  });
  return scores;
}

// ── Room History ──────────────────────────────────────────────

export interface RoomData {
  roomId: string;
  createdBy: string;
  createdAt: ReturnType<typeof serverTimestamp>;
  status: "active" | "ended";
  players: string[];
}

export async function createRoom(roomId: string, createdBy: string) {
  await setDoc(doc(db, "rooms", roomId), {
    roomId,
    createdBy,
    createdAt: serverTimestamp(),
    status: "active",
    players: [createdBy],
  });
}

export async function addPlayerToRoom(roomId: string, userId: string) {
  const roomRef = doc(db, "rooms", roomId);
  const snap = await getDoc(roomRef);
  if (snap.exists()) {
    const data = snap.data();
    const players: string[] = data.players || [];
    if (!players.includes(userId)) {
      players.push(userId);
      await updateDoc(roomRef, { players });
    }
  }
}

export async function endRoom(roomId: string, leaderboard: Record<string, number>) {
  await updateDoc(doc(db, "rooms", roomId), {
    status: "ended",
    endedAt: serverTimestamp(),
    finalLeaderboard: leaderboard,
  });
}

export async function getUserRoomHistory(uid: string, count = 10) {
  // Get rooms where user participated — ordered by creation time
  const q = query(
    collection(db, "rooms"),
    orderBy("createdAt", "desc"),
    limit(count * 3) // fetch extra, filter client-side
  );
  const snap = await getDocs(q);
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((room) => {
      const players = (room as Record<string, unknown>).players as string[] | undefined;
      return players?.includes(uid);
    })
    .slice(0, count);
}

// ── Room Chat Messages ────────────────────────────────────────

export interface ChatMsg {
  userId: string;
  message: string;
  isSystem: boolean;
  timestamp: ReturnType<typeof serverTimestamp>;
}

export async function saveChatMessage(roomId: string, userId: string, message: string, isSystem = false) {
  await addDoc(collection(db, "rooms", roomId, "chat"), {
    userId,
    message,
    isSystem,
    timestamp: serverTimestamp(),
  });
}

export async function getRoomChat(roomId: string, count = 50) {
  const q = query(
    collection(db, "rooms", roomId, "chat"),
    orderBy("timestamp", "asc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ── Room Leaderboard Snapshots ────────────────────────────────

export async function saveLeaderboardSnapshot(roomId: string, leaderboard: Record<string, number>) {
  await setDoc(doc(db, "rooms", roomId, "leaderboard", "latest"), {
    rankings: leaderboard,
    updatedAt: serverTimestamp(),
  });
}

export async function getLeaderboardSnapshot(roomId: string) {
  const snap = await getDoc(doc(db, "rooms", roomId, "leaderboard", "latest"));
  return snap.exists() ? snap.data() : null;
}
