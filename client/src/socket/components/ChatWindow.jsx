import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ messages, typingUsers, onSendMessage, onSetTyping }) => {
  // Create typing status text
  const typingText =
    typingUsers.length > 0
      ? `${typingUsers.join(', ')} ${
          typingUsers.length > 1 ? 'are' : 'is'
        } typing...`
      : '';

  return (
    <>
      {/* MessageList will grow to fill space */}
      <MessageList messages={messages} />
      
      {/* Typing indicator stays at the bottom */}
      <div className="h-6 flex-shrink-0 px-4 pb-1 text-sm italic text-gray-400">
        {typingText}
      </div>
      
      {/* MessageInput is fixed at the bottom */}
      <MessageInput onSendMessage={onSendMessage} onSetTyping={onSetTyping} />
    </>
  );
};

export default ChatWindow;