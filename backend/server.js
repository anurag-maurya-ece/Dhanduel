const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : [/\.vercel\.app$/, 'http://localhost:3000'];

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST']
  }
});

// Pass io instance to sockets configuration
require('./src/orchestration/sockets')(io);

// Load Routes
const apiRoutes = require('./src/orchestration/routes');
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Antigravity Backend running on port ${PORT}`);
});
