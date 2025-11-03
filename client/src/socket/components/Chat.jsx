import { useState, useEffect } from 'react';
import { useSocket } from '../socket';
import UserList from './UserList';
import ChatWindow from './ChatWindow';
import RoomList from './RoomList';
import PrivateChat from './PrivateChat';

const Chat = ({ username, onLogout }) => {
  const [currentRoom, setCurrentRoom] = useState('general');
  const { 
    users, 
    messages, 
    rooms, 
    typingUsers, 
    sendMessage, 
    setTyping, 
    sendPrivateMessage, 
    createRoom: createNewRoom,
    joinRoom,
    sendAttachment,
    directMessages,
    socketId,
  } = useSocket();

  const [openPrivate, setOpenPrivate] = useState([]); // array of peer objects {id, username}

  const openPrivateChat = (user) => {
    if (!user || user.id === socketId) return;
    setOpenPrivate((prev) => {
      if (prev.find((p) => p.id === user.id)) return prev;
      return [...prev, user];
    });
  };

  const closePrivateChat = (peerId) => {
    setOpenPrivate((prev) => prev.filter((p) => p.id !== peerId));
  };

  // Handle room creation
  const handleCreateRoom = (roomName) => {
    if (roomName.trim()) {
      createNewRoom(roomName.trim());
    }
  };

  // Handle room change
  const handleRoomChange = (roomId) => {
    if (roomId !== currentRoom) {
      setCurrentRoom(roomId);
      joinRoom(roomId);
    }
  };

  // Join default room on component mount
  useEffect(() => {
    if (currentRoom === 'general') {
      joinRoom('general');
    }
  }, []);

  return (
    <div className="flex h-full flex-col bg-gray-800">
      {/* Header */}
      <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-3 sm:px-6">
        <h2 className="text-xl font-semibold text-white">Real-Time Chat</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Logged in as: <strong className="text-gray-200">{username}</strong>
          </span>
          <button
            onClick={onLogout}
            className="rounded bg-red-600 px-3 py-1 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main chat body */}
      <main className="flex flex-grow overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col overflow-hidden border-r border-gray-700 bg-gray-800">
          {/* Rooms section */}
          <div className="p-4 border-b border-gray-700">
            <RoomList
              rooms={rooms}
              currentRoom={currentRoom}
                onRoomChange={handleRoomChange}
                onCreateRoom={handleCreateRoom}
            />
          </div>
          
          {/* Users section */}
          <div className="flex-1 overflow-y-auto p-4">
            <UserList users={users} sendPrivateMessage={sendPrivateMessage} onOpenPrivate={openPrivateChat} />
          </div>
        </div>

        {/* Chat Content */}
          <div className="flex flex-grow flex-col">
          <ChatWindow
            messages={messages}
            typingUsers={typingUsers}
            onSendMessage={sendMessage}
            onSetTyping={setTyping}
            onSendAttachment={sendAttachment}
          />
        </div>
        {/* Private chats container */}
        <div className="flex">
          {openPrivate.map((peer) => (
            <PrivateChat
              key={peer.id}
              peer={peer}
              messages={directMessages[peer.id] || []}
              onSend={(to, text) => sendPrivateMessage(to, text)}
              onSendAttachment={(peerId, file) => sendAttachment(file, { to: peerId })}
              onClose={closePrivateChat}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Chat;