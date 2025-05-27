
import React, { useState } from 'react';

interface IntegratorLoginPageProps {
  onIntegratorLogin: (username: string, passwordRef: string) => void;
  loginError: string | null;
  onGoBack: () => void;
}

const IntegratorLoginPage: React.FC<IntegratorLoginPageProps> = ({ onIntegratorLogin, loginError, onGoBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onIntegratorLogin(username, password);
  };

  return (
    <main className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-100">
      <div className="bg-white p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-8">
          Login do Integrador
        </h2>
        {loginError && (
          <div className="mb-6 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md text-sm" role="alert">
            {loginError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="integrator-username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuário Integrador
            </label>
            <input
              id="integrator-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="Nome de usuário do integrador"
            />
          </div>
          <div>
            <label
              htmlFor="integrator-password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              id="integrator-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 px-4 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              placeholder="Senha do integrador"
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg"
            >
              Entrar como Integrador
            </button>
          </div>
        </form>
      </div>
      <button
        onClick={onGoBack}
        className="mt-6 text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
      >
        Voltar à seleção de perfil
      </button>
    </main>
  );
};

export default IntegratorLoginPage;
