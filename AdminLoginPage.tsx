
import React, { useState } from 'react';

interface AdminLoginPageProps {
  onLogin: (username: string, passwordRef: string) => void;
  loginError: string | null;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, loginError }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onLogin(username, password);
  };

  return (
    <main className="flex-grow flex items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">
          Login Administrativo
        </h2>
        {loginError && (
          <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md text-sm" role="alert">
            {loginError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="admin-username" // Changed ID to avoid conflict if another login form is on page
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuário Admin
            </label>
            <input
              id="admin-username" // Changed ID
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
              placeholder="admin"
            />
          </div>
          <div>
            <label
              htmlFor="admin-password" // Changed ID
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha Admin
            </label>
            <input
              id="admin-password" // Changed ID
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out"
              placeholder="admin"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg"
            >
              Entrar no Painel Admin
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default AdminLoginPage;
