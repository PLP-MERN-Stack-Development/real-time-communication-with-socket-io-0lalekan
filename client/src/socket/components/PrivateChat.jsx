import { useState, useEffect, useRef } from 'react';

const PrivateChat = ({ peer, messages = [], onSend, onClose }) => {
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend(peer.id, text.trim());
    setText('');
  };

  return (
    <div className="w-80 shrink-0 flex flex-col border-l border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <strong className="text-white">{peer.username}</strong>
        <button onClick={() => onClose(peer.id)} className="text-sm text-gray-400">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.senderId === peer.id ? 'text-left' : 'text-right'}`}>
            <div className="inline-block max-w-full rounded-md bg-gray-800 px-3 py-1 text-sm text-gray-200">
              {m.system ? <em>{m.message}</em> : m.message}
            </div>
            <div className="text-xs text-gray-400 mt-1">{new Date(m.timestamp).toLocaleTimeString()}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-gray-800">
        <div className="flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} className="flex-1 rounded bg-gray-800 px-3 py-2 text-white" placeholder={`Message ${peer.username}`} />
          <button type="submit" className="rounded bg-blue-600 px-3 py-2 text-white">Send</button>
        </div>
      </form>
    </div>
  );
};

export default PrivateChat;
