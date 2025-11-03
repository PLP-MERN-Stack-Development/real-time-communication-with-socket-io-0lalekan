import { socket } from '../socket'; // Import socket to check self

const UserList = ({ users, sendPrivateMessage }) => {

  const handleUserClick = (user) => {
    // Don't allow messaging self
    if (user.id === socket.id) return;
    
    const message = prompt(`Send private message to ${user.username}:`);
    if (message) {
      // Use the function from our hook
      sendPrivateMessage(user.id, message);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <h3 className="mb-3 border-b border-gray-600 pb-2 text-lg font-semibold text-gray-200">
        Online Users ({users.length})
      </h3>
      <ul className="flex flex-col gap-2">
        {users.map((user) => (
          <li
            key={user.id}
            onClick={() => handleUserClick(user)}
            title={user.id === socket.id ? "This is you" : `Click to message ${user.username}`}
            className={`flex items-center gap-2 rounded-md p-2 transition-colors ${
              user.id === socket.id
                ? 'cursor-default font-bold text-blue-400' // Style for self
                : 'cursor-pointer text-gray-300 hover:bg-gray-700' // Style for others
            }`}
          >
            {/* Online status indicator */}
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </span>
            <span>{user.username}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;