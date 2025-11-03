import { useState, useEffect, useRef } from 'react';

const AttachmentRenderer = ({ msg }) => {
  try {
    if (!msg.data) return null;
    const blob = new Blob([msg.data], { type: msg.mime || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    if ((msg.mime || '').startsWith('image/')) {
      return <img src={url} alt={msg.filename} className="max-w-full rounded" />;
    }
    return (
      <a href={url} download={msg.filename} className="text-sm text-blue-300 underline">
        Download {msg.filename}
      </a>
    );
  } catch (e) {
    return null;
  }
};

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

  const fileRef = useRef(null);
  const handleFile = async (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // send as attachment to peer via onSendAttachment
    if (typeof onSendAttachment === 'function') {
      onSendAttachment(peer.id, f);
    }
    e.target.value = null;
  };

  return (
    <div className="w-80 shrink-0 flex flex-col border-l border-gray-700 bg-gray-900">
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <strong className="text-white">{peer.username}</strong>
        <div className="flex items-center gap-2">
          <input ref={fileRef} type="file" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-gray-300">Attach</button>
          <button onClick={() => onClose(peer.id)} className="text-sm text-gray-400">Close</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {messages.map((m) => (
          <div key={m.id} className={`mb-2 ${m.senderId === peer.id ? 'text-left' : 'text-right'}`}>
            <div className="inline-block max-w-full rounded-md bg-gray-800 px-3 py-1 text-sm text-gray-200">
              {m.system ? (
                <em>{m.message}</em>
              ) : (
                <>
                  {m.message && <div>{m.message}</div>}
                  {m.filename && (
                    <div className="mt-2">
                      <AttachmentRenderer msg={m} />
                    </div>
                  )}
                </>
              )}
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
