import { useState } from 'react';

const RoomList = ({ rooms, currentRoom, onRoomChange, onCreateRoom }) => {
  const [newRoomName, setNewRoomName] = useState('');

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (newRoomName.trim()) {
      onCreateRoom(newRoomName.trim());
      setNewRoomName('');
    }
  };

  // Show default room if no rooms are available
  const displayRooms = rooms.length > 0 ? rooms : [{ id: 'general', name: 'General Chat' }];

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-200 mb-2">Rooms</h3>
        <form onSubmit={handleCreateRoom} className="flex gap-2">
          <input
            type="text"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="New room name"
            className="flex-1 px-3 py-1 bg-gray-700 text-gray-100 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create
          </button>
        </form>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
            {displayRooms.map((room) => (
            <li key={room.id}>
              <button
                onClick={() => onRoomChange(room.id)}
                className={`w-full px-4 py-2 text-left rounded transition-colors ${
                  currentRoom === room.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="font-medium">{room.name}</span>
                {room.unreadCount > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {room.unreadCount}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RoomList;