
import React from 'react';
import { APP_TITLE, LOGO_ISRAEL_RAMOS_PATH, LOGO_WEG_PATH } from '../constants';
import { Integrator } from '../types';

interface HeaderProps {
  loggedInIntegrator?: Integrator | null;
  onIntegratorLogout?: () => void;
  appScreen?: string; // To know if we are in admin or integrator context
}

const Header: React.FC<HeaderProps> = ({ loggedInIntegrator, onIntegratorLogout, appScreen }) => {
  // Corrected placeholder checks:
  // A path is a placeholder if it still contains the "YOUR_" marker.
  const isIsraelRamosLogoAPlaceholder = LOGO_ISRAEL_RAMOS_PATH.includes('YOUR_');
  const isWegLogoAPlaceholder = LOGO_WEG_PATH.includes('YOUR_');

  return (
    <header className="bg-gradient-to-r from-blue-600 via-sky-500 to-cyan-400 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {!isWegLogoAPlaceholder && (
            <img
              src={LOGO_WEG_PATH}
              alt="Logo WEG"
              className="h-10 sm:h-12 mr-2 object-contain"
              style={{ maxHeight: '48px' }}
              onError={(e) => (e.currentTarget.style.display = 'none')} // Oculta se a imagem não carregar
            />
          )}
          {!isIsraelRamosLogoAPlaceholder && (
            <img
              src={LOGO_ISRAEL_RAMOS_PATH}
              alt="Logo Israel Ramos"
              className="h-10 sm:h-12 mr-3 object-contain"
              style={{ maxHeight: '48px' }}
              onError={(e) => (e.currentTarget.style.display = 'none')} // Oculta se a imagem não carregar
            />
          )}
          {(isWegLogoAPlaceholder && isIsraelRamosLogoAPlaceholder) && ( // Show SVG if both logos are placeholders
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mr-3 text-yellow-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-6.364-.386 1.591-1.591M3 12h2.25m.386-6.364 1.591 1.591" />
            </svg>
          )}
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{APP_TITLE}</h1>
        </div>
        {loggedInIntegrator && onIntegratorLogout && (appScreen === 'integrator_configurator' || appScreen === 'customer_configurator') && (
          <div className="flex items-center space-x-3">
            <span className="text-sm hidden sm:block">
              Logado como: <span className="font-semibold">{loggedInIntegrator.displayName || loggedInIntegrator.username}</span>
            </span>
            <button
              onClick={onIntegratorLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
              aria-label="Sair da conta de integrador"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
