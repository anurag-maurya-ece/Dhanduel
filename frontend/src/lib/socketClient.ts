import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const initSocket = (): Socket => {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
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
