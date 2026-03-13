module.exports = (io) => {
    // Basic room tracking
    const roomSnapshots = {};

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on('join-room', ({ roomId, userId }) => {
            socket.join(roomId);
            console.log(`User ${userId} joined room ${roomId}`);
            
            // Initialize room snapshot if it doesn't exist
            if (!roomSnapshots[roomId]) {
                roomSnapshots[roomId] = {};
            }
            
            // Notify others in the room
            socket.to(roomId).emit('user-joined', { userId });

            // System chat message
            io.to(roomId).emit('chat-message', {
                userId: 'System',
                message: `${userId} joined the room`,
                timestamp: Date.now(),
                isSystem: true,
            });
        });

        // ── Chat Messages ─────────────────────────────────────
        socket.on('chat-message', ({ roomId, userId, message }) => {
            io.to(roomId).emit('chat-message', {
                userId,
                message,
                timestamp: Date.now(),
                isSystem: false,
            });
        });

        socket.on('update-leaderboard', ({ roomId, userId, pnl }) => {
            if (roomSnapshots[roomId]) {
                roomSnapshots[roomId][userId] = pnl;
                // Broadcast updated leaderboard to room
                io.to(roomId).emit('leaderboard-updated', roomSnapshots[roomId]);
            }
        });

        socket.on('leave-room', ({ roomId, userId }) => {
            socket.leave(roomId);
            console.log(`User ${userId} left room ${roomId}`);
            socket.to(roomId).emit('user-left', { userId });

            // System chat message
            socket.to(roomId).emit('chat-message', {
                userId: 'System',
                message: `${userId} left the room`,
                timestamp: Date.now(),
                isSystem: true,
            });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });
};
