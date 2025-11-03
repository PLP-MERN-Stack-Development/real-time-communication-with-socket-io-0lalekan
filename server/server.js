// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const rooms = {
  general: {
    id: 'general',
    name: 'General Chat',
    messages: [],
    users: new Set(),
  }
};
const messages = [];
const typingUsers = {};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  let currentRoom = 'general';

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id };
    socket.join('general'); // Join default room
    rooms.general.users.add(socket.id);
    
    io.emit('user_list', Object.values(users));
    io.emit('room_list', Object.values(rooms));
    io.emit('user_joined', { username, id: socket.id });
    console.log(`${username} joined the chat`);
  });

  // Handle room creation
  socket.on('create_room', (roomName) => {
    const roomId = roomName.toLowerCase().replace(/\s+/g, '-');
    if (!rooms[roomId]) {
      rooms[roomId] = {
        id: roomId,
        name: roomName,
        messages: [],
        users: new Set(),
      };
      io.emit('room_list', Object.values(rooms));
    }
  });

  // Handle room joining
  socket.on('join_room', (roomId) => {
    if (rooms[roomId]) {
      socket.leave(currentRoom);
      rooms[currentRoom].users.delete(socket.id);
      
      socket.join(roomId);
      rooms[roomId].users.add(socket.id);
      currentRoom = roomId;
      
      // Send room history
      socket.emit('message_history', rooms[roomId].messages);
      io.to(roomId).emit('user_list', Array.from(rooms[roomId].users).map(id => users[id]));
    }
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const message = {
      ...messageData,
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      timestamp: new Date().toISOString(),
      roomId: currentRoom
    };
    
    // Add message to room history
    if (rooms[currentRoom]) {
      rooms[currentRoom].messages.push(message);
      
      // Limit stored messages to prevent memory issues
      if (rooms[currentRoom].messages.length > 100) {
        rooms[currentRoom].messages.shift();
      }
      
      // Emit only to users in the current room
      io.to(currentRoom).emit('receive_message', message);
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      to, // recipient socket id
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };

    // Emit to recipient and sender (so both have the message)
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 