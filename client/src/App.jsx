// client/src/App.jsx

import { useState, useEffect } from 'react';
import { useSocket } from './socket/socket';
import Login from './socket/components/Login';
import Chat from './socket/components/Chat';

function App() {
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { connect, disconnect, isConnected } = useSocket();

  const handleLogin = (name) => {
    if (name) {
      setUsername(name);
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    disconnect();
    setIsLoggedIn(false);
    setUsername('');
  };

  // Connect to socket when user logs in
  useEffect(() => {
    if (isLoggedIn && username) {
      connect(username);
    }
    return () => {
      disconnect();
    };
  }, [isLoggedIn, username]);

  return (
    // Main app container, centered on screen
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 p-4">
      {/* Chat application wrapper */}
      <div className="flex h-full w-full max-w-5xl max-h-[800px] flex-col overflow-hidden rounded-lg border border-gray-700 shadow-2xl">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <Chat username={username} onLogout={handleLogout} />
        )}
      </div>
    </div>
  );
}

export default App;