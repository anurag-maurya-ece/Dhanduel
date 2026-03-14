"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { initSocket, disconnectSocket, hasRealtimeBackend } from "../lib/socketClient";
import { useAuth } from "@/lib/AuthContext";
import ArenaTradePanel from "./ArenaTradePanel";
import {
  createRoom, addPlayerToRoom, endRoom, getUserRoomHistory,
  saveChatMessage, saveLeaderboardSnapshot, getRoomChat,
} from "@/lib/firestoreService";
import {
  Users, Crown, ArrowRight, Play, Wifi, WifiOff, RefreshCw,
  Copy, Check, Send, MessageCircle, History, Trophy, LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error" | "unavailable";

interface ChatMessage {
  userId: string;
  message: string;
  timestamp: number;
  isSystem: boolean;
}

interface RoomHistoryItem {
  id: string;
  roomId?: string;
  createdBy?: string;
  createdAt?: { seconds: number };
  status?: string;
  players?: string[];
  finalLeaderboard?: Record<string, number>;
}

export default function MultiplayerLobby() {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [inRoom, setInRoom] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Record<string, number>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [copied, setCopied] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Room history
  const [roomHistory, setRoomHistory] = useState<RoomHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const userId = user?.displayName || user?.email?.split("@")[0] || `trader_${Math.floor(Math.random() * 10000)}`;

  // Load room history on mount
  useEffect(() => {
    if (!userId) return;
    getUserRoomHistory(userId, 8)
      .then((rooms) => setRoomHistory(rooms as RoomHistoryItem[]))
      .catch(() => {})
      .finally(() => setLoadingHistory(false));
  }, [userId]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const connectSocket = useCallback(() => {
    if (!hasRealtimeBackend()) {
      setConnectionStatus("unavailable");
      return null;
    }

    setConnectionStatus("connecting");
    const socket = initSocket();

    if (!socket) {
      setConnectionStatus("unavailable");
      return null;
    }

    socket.on("connect", () => {
      setConnectionStatus("connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("connect_error", () => {
      setConnectionStatus("error");
    });

    socket.on("user-joined", (data: { userId: string }) => {
      console.log("User joined:", data.userId);
    });

    socket.on("leaderboard-updated", (data: Record<string, number>) => {
      setLeaderboard(data);
      // Save leaderboard snapshot to Firestore (fire-and-forget)
      if (roomIdRef.current) {
        saveLeaderboardSnapshot(roomIdRef.current, data).catch(() => {});
      }
    });

    // Chat messages
    socket.on("chat-message", (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return socket;
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    return () => {
      if (!socket) {
        return;
      }

      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("user-joined");
      socket.off("leaderboard-updated");
      socket.off("chat-message");
      disconnectSocket();
    };
  }, [connectSocket]);

  const handleRetry = () => {
    if (!hasRealtimeBackend()) {
      setConnectionStatus("unavailable");
      return;
    }

    disconnectSocket();
    connectSocket();
  };

  // Ref to track current roomId for socket callbacks
  const roomIdRef = useRef("");
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);

  const handleCreateRoom = () => {
    const newRoom = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoom);
    setInRoom(true);
    setMessages([]); // New room = fresh chat
    const socket = initSocket();
    if (!socket) {
      setConnectionStatus("unavailable");
      return;
    }
    socket.emit("join-room", { roomId: newRoom, userId });
    socket.emit("update-leaderboard", { roomId: newRoom, userId, pnl: 0 });
    // Save room to Firestore
    createRoom(newRoom, userId).catch(() => {});
  };

  const handleJoinRoom = () => {
    if (!joinCode) return;
    const code = joinCode.toUpperCase();
    setRoomId(code);
    setInRoom(true);
    // Load previous chat from Firestore
    getRoomChat(code, 50)
      .then((msgs) => {
        const loaded: ChatMessage[] = msgs.map((m) => ({
          userId: (m as Record<string, unknown>).userId as string || "Unknown",
          message: (m as Record<string, unknown>).message as string || "",
          timestamp: ((m as Record<string, unknown>).timestamp as { seconds: number })?.seconds * 1000 || Date.now(),
          isSystem: (m as Record<string, unknown>).isSystem as boolean || false,
        }));
        setMessages(loaded);
      })
      .catch(() => setMessages([]));
    const socket = initSocket();
    if (!socket) {
      setConnectionStatus("unavailable");
      return;
    }
    socket.emit("join-room", { roomId: code, userId });
    socket.emit("update-leaderboard", { roomId: code, userId, pnl: 0 });
    // Add player to Firestore room
    addPlayerToRoom(code, userId).catch(() => {});
  };

  const handleLeaveRoom = () => {
    const socket = initSocket();
    socket?.emit("leave-room", { roomId, userId });
    // Save final leaderboard
    endRoom(roomId, leaderboard).catch(() => {});
    setInRoom(false);
    setRoomId("");
    setMessages([]);
    setLeaderboard({});
    // Refresh history
    getUserRoomHistory(userId, 8)
      .then((rooms) => setRoomHistory(rooms as RoomHistoryItem[]))
      .catch(() => {});
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const socket = initSocket();
    if (!socket) {
      setConnectionStatus("unavailable");
      return;
    }
    const msg = chatInput.trim();
    socket.emit("chat-message", { roomId, userId, message: msg });
    // Save to Firestore (fire-and-forget)
    saveChatMessage(roomId, userId, msg).catch(() => {});
    setChatInput("");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusConfig = {
    connecting: { icon: RefreshCw, text: "Connecting…", color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/20", animate: true },
    connected: { icon: Wifi, text: "Connected to game server", color: "text-green-400", bg: "bg-green-400/10 border-green-400/20", animate: false },
    disconnected: { icon: WifiOff, text: "Reconnecting…", color: "text-orange-400", bg: "bg-orange-400/10 border-orange-400/20", animate: true },
    error: { icon: WifiOff, text: "Cannot reach server", color: "text-red-400", bg: "bg-red-400/10 border-red-400/20", animate: false },
    unavailable: { icon: WifiOff, text: "Realtime backend not configured", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", animate: false },
  };

  const currentStatus = statusConfig[connectionStatus];
  const StatusIcon = currentStatus.icon;
  const isOnline = connectionStatus === "connected";

  // ─── In Room View ─────────────────────────────────────────

  if (inRoom) {
    return (
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 p-4 pb-28">
        {/* Room Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-colors duration-300"
        >
          <div>
            <h2 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Room Code</h2>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-mono font-bold text-cyan-600 dark:text-cyan-400 tracking-widest transition-colors">{roomId}</div>
              <button onClick={handleCopyCode} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Copy code">
                {copied ? <Check className="w-4 h-4 text-green-500 dark:text-green-400" /> : <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors ${currentStatus.bg}`}>
              <StatusIcon className={`w-3 h-3 ${currentStatus.color} ${currentStatus.animate ? "animate-spin" : ""}`} />
              <span className={currentStatus.color}>{currentStatus.text}</span>
            </div>
            <button
              onClick={handleLeaveRoom}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/20 bg-red-500/10 text-red-600 dark:text-red-400 text-xs hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-3 h-3" /> Leave
            </button>
            <div className="text-right">
              <div className="text-gray-500 text-xs uppercase">Players</div>
              <div className="text-xl font-bold flex items-center text-gray-900 dark:text-white transition-colors">
                <Users className="w-4 h-4 mr-1 text-purple-600 dark:text-purple-400" />
                {Object.keys(leaderboard).length || 1}
              </div>
            </div>
          </div>
        </motion.div>

        {connectionStatus === "unavailable" && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300 transition-colors">
            Multiplayer needs a deployed backend server. Set `NEXT_PUBLIC_API_URL` in Vercel to your live Socket.IO backend URL.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Leaderboard — left column */}
          <div className="glass-panel p-5 rounded-2xl lg:col-span-3 transition-colors duration-300">
            <h3 className="text-sm font-bold flex items-center mb-4 uppercase tracking-wider text-gray-500">
              <Crown className="w-4 h-4 mr-2 text-yellow-500 dark:text-yellow-400" /> Rankings
            </h3>
            <div className="flex flex-col gap-2">
              {Object.entries(leaderboard)
                .sort(([, a], [, b]) => b - a)
                .map(([uid, pnl], i) => (
                  <div key={uid} className={`flex justify-between items-center p-3 rounded-xl transition-colors ${uid === userId ? "bg-cyan-500/10 border border-cyan-500/20" : "bg-black/5 dark:bg-white/[0.02]"}`}>
                    <div className="flex items-center gap-2">
                      <div className={`font-bold w-6 h-6 rounded-full flex items-center justify-center text-[10px] transition-colors ${i === 0 ? "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400" : i === 1 ? "bg-gray-400/15 text-gray-500 dark:text-gray-300" : i === 2 ? "bg-amber-600/15 text-amber-600 dark:text-amber-500" : "bg-black/10 dark:bg-gray-800 text-gray-500"}`}>
                        {i + 1}
                      </div>
                      <span className="font-mono text-xs text-gray-900 dark:text-white transition-colors">{uid === userId ? "You" : uid}</span>
                    </div>
                    <span className={`font-mono font-bold text-xs transition-colors ${pnl >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                      {pnl > 0 ? "+" : ""}${pnl.toFixed(2)}
                    </span>
                  </div>
                ))}
              {Object.keys(leaderboard).length === 0 && (
                <div className="text-center text-gray-500 py-6 text-xs">Waiting for trades…</div>
              )}
            </div>
          </div>

          {/* Trading Panel — center */}
          <div className="lg:col-span-5">
            <ArenaTradePanel roomId={roomId} userId={userId} />
          </div>

          {/* Chat Panel — right */}
          <div className="glass-panel rounded-2xl flex flex-col lg:col-span-4 overflow-hidden transition-colors duration-300" style={{ minHeight: 380 }}>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-black/10 dark:border-white/10 flex items-center gap-2 transition-colors">
              <MessageCircle className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white transition-colors">Room Chat</h3>
              <span className="ml-auto text-xs text-gray-500">{messages.length} messages</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2 bg-transparent" style={{ maxHeight: 300 }}>
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                  No messages yet. Say hi! 👋
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={msg.isSystem
                    ? "text-center text-xs text-gray-500 py-1"
                    : `flex flex-col ${msg.userId === userId ? "items-end" : "items-start"}`
                  }
                >
                  {msg.isSystem ? (
                    <span className="bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full transition-colors">{msg.message}</span>
                  ) : (
                    <>
                      <span className="text-[10px] text-gray-500 mb-0.5 px-1">
                        {msg.userId === userId ? "You" : msg.userId}
                      </span>
                      <div
                        className={`px-3 py-2 rounded-2xl max-w-[80%] text-sm transition-colors ${
                          msg.userId === userId
                            ? "bg-cyan-500/20 text-cyan-700 dark:text-cyan-100 rounded-br-sm border border-cyan-500/20 dark:border-transparent"
                            : "bg-black/5 dark:bg-white/5 text-gray-800 dark:text-gray-300 rounded-bl-sm border border-black/10 dark:border-transparent"
                        }`}
                      >
                        {msg.message}
                      </div>
                    </>
                  )}
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-black/10 dark:border-white/10 transition-colors">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type a message…"
                  className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-cyan-500/40 transition-colors placeholder-gray-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim()}
                  className="px-4 bg-cyan-500/20 border border-cyan-500/20 hover:bg-cyan-500 hover:text-white dark:hover:text-gray-900 text-cyan-700 dark:text-cyan-400 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Lobby View ───────────────────────────────────────────

  return (
    <div className="w-full max-w-md mx-auto z-10 p-4 pb-28">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 rounded-3xl transition-colors duration-300"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-colors">
            <Users className="w-10 h-10" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-center mb-2 text-gray-900 dark:text-white transition-colors">Multiplayer</h2>
        <p className="text-center text-gray-500 mb-6">
          Compete with friends in real-time stock simulations.
        </p>

        {/* Connection Status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={connectionStatus}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm mb-6 transition-colors ${currentStatus.bg}`}
          >
            <StatusIcon className={`w-4 h-4 ${currentStatus.color} ${currentStatus.animate ? "animate-spin" : ""}`} />
            <span className={currentStatus.color}>{currentStatus.text}</span>
            {connectionStatus === "error" && (
              <button onClick={handleRetry} className="ml-2 px-2 py-0.5 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 rounded text-xs text-gray-800 dark:text-white transition-colors">
                Retry
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={handleCreateRoom}
          disabled={!isOnline}
          className="w-full bg-purple-600 dark:bg-purple-500 text-white font-bold py-4 rounded-xl mb-6 hover:bg-purple-500 dark:hover:bg-purple-400 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Create New Room
        </button>

        <div className="relative flex items-center py-4 mb-2">
          <div className="flex-grow border-t border-black/10 dark:border-white/10 transition-colors" />
          <span className="flex-shrink-0 mx-4 text-gray-500 text-sm">or join existing</span>
          <div className="flex-grow border-t border-black/10 dark:border-white/10 transition-colors" />
        </div>

        <div className="flex bg-black/5 dark:bg-white/[0.03] rounded-xl overflow-hidden border border-black/10 dark:border-white/10 focus-within:border-cyan-500/50 transition-colors">
          <input
            type="text"
            placeholder="Enter 6-Digit Code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            disabled={!isOnline}
            className="w-full bg-transparent px-6 py-4 outline-none font-mono uppercase tracking-widest text-gray-900 dark:text-white placeholder:normal-case placeholder:tracking-normal disabled:opacity-40 placeholder-gray-500"
            maxLength={6}
          />
          <button
            onClick={handleJoinRoom}
            disabled={!isOnline || !joinCode}
            className="px-6 bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-cyan-500 hover:text-white dark:hover:text-gray-900 transition-colors flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed border-l border-black/10 dark:border-white/10"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Room History */}
      {roomHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 rounded-3xl mt-6 max-w-md mx-auto w-full transition-colors duration-300"
        >
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4 uppercase tracking-wider text-gray-500">
            <History className="w-4 h-4" /> Recent Rooms
          </h3>
          <div className="flex flex-col gap-2">
            {roomHistory.map((room, i) => {
              const lb = room.finalLeaderboard || {};
              const sorted = Object.entries(lb).sort(([, a], [, b]) => b - a);
              const winner = sorted[0];
              const ts = room.createdAt?.seconds
                ? new Date(room.createdAt.seconds * 1000).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                : "";
              return (
                <div key={room.id} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/[0.02] hover:bg-black/10 dark:hover:bg-white/[0.05] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="font-mono text-xs text-cyan-600 dark:text-cyan-400 font-bold transition-colors">{room.roomId || room.id}</div>
                    <div className="text-[10px] text-gray-500">{ts}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-[10px] text-gray-500">{(room.players || []).length} players</div>
                    {winner && (
                      <div className="flex items-center gap-1 text-xs">
                        <Trophy className="w-3 h-3 text-yellow-500 dark:text-yellow-400 transition-colors" />
                        <span className="text-yellow-600 dark:text-yellow-400 font-mono transition-colors">{winner[0] === userId ? "You" : winner[0]}</span>
                        <span className={`font-mono font-bold transition-colors ${winner[1] >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          {winner[1] > 0 ? "+" : ""}${winner[1].toFixed(0)}
                        </span>
                      </div>
                    )}
                    {room.status === "ended" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 dark:bg-gray-800 text-gray-500">Ended</span>
                    )}
                    {room.status === "active" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400">Active</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {loadingHistory && (
        <div className="flex justify-center mt-4">
          <RefreshCw className="w-4 h-4 text-gray-500 animate-spin" />
        </div>
      )}
    </div>
  );
}
