import { useSocket } from '../socket';
import UserList from './UserList';
import ChatWindow from './ChatWindow';

const Chat = ({ username, onLogout }) => {
  const { users, messages, typingUsers, sendMessage, setTyping, sendPrivateMessage } = useSocket();

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
        <div className="w-64 flex-shrink-0 overflow-y-auto border-r border-gray-700 bg-gray-800 p-4">
          <UserList users={users} sendPrivateMessage={sendPrivateMessage} />
        </div>

        {/* Chat Content */}
        <div className="flex flex-grow flex-col">
          <ChatWindow
            messages={messages}
            typingUsers={typingUsers}
            onSendMessage={sendMessage}
            onSetTyping={setTyping}
          />
        </div>
      </main>
    </div>
  );
};

export default Chat;