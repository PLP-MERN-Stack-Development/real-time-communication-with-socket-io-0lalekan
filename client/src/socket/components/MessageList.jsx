import { useEffect, useRef } from 'react';
import { socket } from '../socket'; // Import the raw socket instance

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);
  const mySocketId = socket.id; // Get our own socket ID to check if we sent the message

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    // Add the custom scrollbar class here
    <div className="message-list flex-grow space-y-3 overflow-y-auto p-4">
      {messages.map((msg) => {
        
        // System Message (Join/Left)
        if (msg.system) {
          return (
            <div key={msg.id} className="self-center text-sm italic text-gray-500">
              {msg.message}
            </div>
          );
        }

        const isSent = msg.senderId === mySocketId;

        // Private Message
        if (msg.isPrivate) {
          return (
            <div
              key={msg.id}
              className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div className="w-fit max-w-lg rounded-lg border border-purple-500 bg-purple-900/50 px-4 py-2 shadow">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="font-bold text-purple-300">{isSent ? 'You' : msg.sender}</span>
                  <span className="text-xs text-purple-300">(Private)</span>
                </div>
                <p className="text-white">{msg.message}</p>
                <span className="float-right mt-1 text-xs text-gray-400">
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
            </div>
          );
        }
        
        // Public Message
        return (
          <div
            key={msg.id}
            className={`flex w-full ${isSent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`w-fit max-w-lg rounded-lg px-4 py-2 shadow ${
                isSent
                  ? 'rounded-br-sm bg-blue-600 text-white' // Sent messages
                  : 'rounded-bl-sm bg-gray-600 text-white' // Received messages
              }`}
            >
              {!isSent && (
                <div className="mb-1 text-sm font-bold text-gray-300">
                  {msg.sender}
                </div>
              )}
              <p>{msg.message}</p>
              <span className="float-right mt-1 text-xs text-gray-400">
                {formatTimestamp(msg.timestamp)}
              </span>
            </div>
          </div>
        );
      })}
      {/* Empty div to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;