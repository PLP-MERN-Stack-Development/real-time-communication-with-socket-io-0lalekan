// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Room management functions
const DEFAULT_ROOM = 'general';
export const createRoom = (roomName) => {
  socket.emit('create_room', roomName);
};

export const joinRoom = (roomId) => {
  socket.emit('join_room', roomId);
};

export const leaveRoom = (roomId) => {
  socket.emit('leave_room', roomId);
};

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([
    { id: 'general', name: 'General Chat', unreadCount: 0 }
  ]);
  const [directMessages, setDirectMessages] = useState({}); // { peerId: [msg, ...] }
  const [typingUsers, setTypingUsers] = useState([]);

  // Connect to socket server
  const connect = (username) => {
    if (!socket.connected) {
      socket.connect();
      if (username) {
        socket.emit('user_join', username);
      }
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    if (socket.connected) {
      socket.disconnect();
    }
  };

  // Send a message
  const sendMessage = (message) => {
    if (socket.connected) {
      socket.emit('send_message', { message });
    }
  };

  // Send an attachment (room or private). `options` can contain { roomId, to }
  const sendAttachment = async (file, options = {}) => {
    if (!socket.connected || !file) return;
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const payload = {
      filename: file.name,
      mime: file.type,
      buffer: arrayBuffer,
      roomId: options.roomId,
      to: options.to,
    };
    socket.emit('send_attachment', payload);
  };

  // Create a new room
  const createNewRoom = (roomName) => {
    if (socket.connected) {
      socket.emit('create_room', roomName);
    }
  };

  // Join a room
  const joinRoom = (roomId) => {
    if (socket.connected && roomId) {
      socket.emit('join_room', roomId);
    }
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
      // show notification and sound
      try {
        if (document.hidden && Notification.permission === 'granted') {
          new Notification(`${message.isPrivate ? 'Private' : 'New'} message`, {
            body: message.system ? message.message : `${message.sender}: ${message.message}`,
          });
        }
      } catch (e) {}
      // simple beep
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 1000;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.2);
        setTimeout(() => { try { o.stop(); ctx.close(); } catch(e){} }, 300);
      } catch (e) {}
    };

    const onReceiveAttachment = (attachment) => {
      // For room attachments, append to messages; for private, store in directMessages
      if (attachment.isPrivate && attachment.to) {
        const peerId = (attachment.senderId === socket.id) ? attachment.to : attachment.senderId;
        setDirectMessages((prev) => {
          const conv = prev[peerId] ? [...prev[peerId]] : [];
          conv.push(attachment);
          return { ...prev, [peerId]: conv };
        });
      } else {
        setMessages((prev) => [...prev, attachment]);
      }
      // Notify user
      try {
        if (document.hidden && Notification.permission === 'granted') {
          new Notification(`${attachment.isPrivate ? 'Private' : 'New'} attachment`, {
            body: `${attachment.sender}: ${attachment.filename}`,
          });
        }
      } catch (e) {}
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = 900;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.22);
        setTimeout(() => { try { o.stop(); ctx.close(); } catch(e){} }, 300);
      } catch (e) {}
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      // Determine peer id for storing the private conversation
      const peerId = (message.senderId === socket.id) ? message.to : message.senderId;
      if (!peerId) return; // defensive

      setDirectMessages((prev) => {
        const conv = prev[peerId] ? [...prev[peerId]] : [];
        conv.push(message);
        return { ...prev, [peerId]: conv };
      });
      try {
        if (document.hidden && Notification.permission === 'granted') {
          new Notification(`Private message from ${message.sender}`, { body: message.message });
        }
      } catch (e) {}
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 1200;
        o.connect(g);
        g.connect(ctx.destination);
        o.start();
        g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.15);
        setTimeout(() => { try { o.stop(); ctx.close(); } catch(e){} }, 250);
      } catch (e) {}
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Room events
    const onRoomList = (roomList) => {
      setRooms(roomList);
    };

    const onMessageHistory = (history) => {
      setMessages(history);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
  socket.on('private_message', onPrivateMessage);
  socket.on('receive_attachment', onReceiveAttachment);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('room_list', onRoomList);
    socket.on('message_history', onMessageHistory);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
  socket.off('private_message', onPrivateMessage);
  socket.off('receive_attachment', onReceiveAttachment);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('room_list', onRoomList);
      // Request notification permission once connected
      if (Notification && Notification.permission !== 'granted') {
        try {
          Notification.requestPermission();
        } catch (e) {}
      }
      socket.off('message_history', onMessageHistory);
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    messages,
    users,
    socketId: socket.id,
    directMessages,
    rooms,
    typingUsers,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    sendAttachment,
    setTyping,
    createRoom: createNewRoom,
    joinRoom,
  };
};

export default socket; 