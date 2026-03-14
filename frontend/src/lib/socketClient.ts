import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const getRealtimeApiUrl = (): string | null => {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  if (typeof window !== "undefined") {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return "http://localhost:5000";
    }
  }

  return null;
};

export const hasRealtimeBackend = () => getRealtimeApiUrl() !== null;

export const initSocket = (): Socket | null => {
  const apiUrl = getRealtimeApiUrl();

  if (!apiUrl) {
    return null;
  }

  if (!socket) {
    socket = io(apiUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 5000,
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const isConnected = () => socket?.connected ?? false;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};
