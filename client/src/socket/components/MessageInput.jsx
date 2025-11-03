import { useState, useRef } from 'react';

const MessageInput = ({ onSendMessage, onSetTyping, onSendAttachment }) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef(null);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      
      // Stop typing on send
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      onSetTyping(false);
    }
  };

  const handleTyping = () => {
    // Notify start typing
    onSetTyping(true);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to notify stop typing after 2s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      onSetTyping(false);
      typingTimeoutRef.current = null;
    }, 2000);
  };

  return (
    <form
      className="flex w-full flex-shrink-0 items-center gap-3 border-t border-gray-700 bg-gray-900 p-4"
      onSubmit={handleSubmit}
    >
      <input ref={fileRef} type="file" className="hidden" onChange={async (e) => {
        const f = e.target.files && e.target.files[0];
        if (f) {
          // prefer dedicated onSendAttachment prop if provided
          if (typeof onSendAttachment === 'function') {
            onSendAttachment(f);
          } else if (typeof onSendMessage === 'function' && onSendMessage.sendAttachment) {
            onSendMessage.sendAttachment(f);
          }
        }
        e.target.value = null;
      }} />
      <button type="button" onClick={() => fileRef.current?.click()} className="rounded bg-gray-700 px-3 py-2 text-gray-200">Attach</button>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
          handleTyping();
        }}
        className="flex-grow rounded border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={!message.trim()}
        className="rounded bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;