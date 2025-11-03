import { useState } from 'react';

const Login = ({ onLogin }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onLogin(name.trim());
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gray-800 p-4">
      <form
        className="flex w-full max-w-sm flex-col gap-4 rounded-lg bg-gray-900 p-8 shadow-md"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-3xl font-bold text-white">Join Chat</h1>
        <input
          type="text"
          placeholder="Enter your username"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
          className="rounded border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!name.trim()}
          className="rounded bg-blue-600 px-4 py-2 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700 disabled:text-gray-400"
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default Login;