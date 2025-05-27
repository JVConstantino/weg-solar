
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white text-center p-8 mt-auto">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Orçamento Solar Fácil. Todos os direitos reservados.</p>
        <p className="text-sm text-gray-400 mt-2">
          Este é um simulador e os valores são estimativas. Um orçamento preciso requer análise técnica.
        </p>
      </div>
    </footer>
  );
};

export default Footer;