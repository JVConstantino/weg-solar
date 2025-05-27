
import React from 'react';
import { QuoteEstimate, QuoteFormData } from '../types';

interface QuoteResultProps {
  estimate: QuoteEstimate | null;
  formData: QuoteFormData | null;
  onReset: () => void;
  onPrint: () => void; 
}

const QuoteResult: React.FC<QuoteResultProps> = ({ estimate, formData, onReset, onPrint }) => {
  if (!estimate || !formData) return null;

  const formatCurrency = (value?: number) => {
    if (value == null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const getSizingAlertColor = (ratio?: number): string => {
    if (ratio == null) return 'text-gray-600';
    if (ratio < 0.8 || ratio > 1.3) return 'text-red-600 font-semibold'; 
    if (ratio < 0.9 || ratio > 1.2) return 'text-yellow-600';
    return 'text-green-600 font-semibold';
  };

  const isCartao = estimate.paymentType === 'cartao';
  
  return (
    <div className="mt-10 p-6 sm:p-8 bg-white shadow-2xl rounded-xl animate-fadeIn">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 text-center">
        Seu Orçamento Detalhado <span className="text-yellow-400">☀️</span>
      </h2>
      {estimate.quoteNumber && (
        <p className="text-center text-sm text-gray-500 mb-6">
          Orçamento Nº: <strong className="text-gray-700">{estimate.quoteNumber}</strong>
        </p>
      )}
      
      {estimate.validationWarnings && estimate.validationWarnings.length > 0 && (
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-red-700 mb-2">Avisos Importantes:</h3>
          <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
            {estimate.validationWarnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 p-4 border border-green-300 bg-green-50 rounded-lg shadow-sm">
        <p className="text-lg text-gray-700">Olá, <strong className="text-green-700 font-semibold">{formData.name}</strong>!</p>
        <p className="text-sm text-gray-600 mt-1">
          Para instalação em <strong className="text-gray-700">{formData.installationCity}</strong>, 
          com telhado tipo <strong className="text-gray-700">{formData.roofType}</strong>, aqui está sua simulação:
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {estimate.systemSizeKWp != null && (
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm border border-blue-200">
            <h3 className="text-md sm:text-lg font-semibold text-blue-700 mb-1">Potência dos Painéis (DC)</h3>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {estimate.systemSizeKWp.toFixed(2)} kWp
            </p>
          </div>
        )}
         {estimate.actualInverterCapacityKw != null && (
            <div className="bg-indigo-50 p-4 rounded-lg shadow-sm border border-indigo-200">
                <h3 className="text-md sm:text-lg font-semibold text-indigo-700 mb-1">Potência do(s) Inversor(es) (AC)</h3>
                <p className={`text-xl sm:text-2xl font-bold ${getSizingAlertColor(estimate.inverterSizingRatio)}`}>
                    {estimate.actualInverterCapacityKw.toFixed(2)} kW
                </p>
                {estimate.inverterSystemNote && <p className="text-xs text-indigo-600 mt-1">{estimate.inverterSystemNote}</p>}
            </div>
        )}
      </div>


      {estimate.componentDetails && estimate.componentDetails.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Detalhamento dos Componentes:</h3>
          <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Componente</th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd.</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Unit.</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estimate.componentDetails.map((item, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{item.name}{item.notes && <span className="block text-xs text-gray-500">{item.notes}</span>}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{item.quantity}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 font-semibold text-right">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-right text-lg font-bold text-gray-800 mt-3 pr-2">
            Subtotal Componentes: {formatCurrency(estimate.totalComponentCost)}
          </p>
        </div>
      )}
      
      <div className="bg-purple-50 p-6 rounded-lg shadow-xl border border-purple-200 mb-8">
        <h3 className="text-xl sm:text-2xl font-semibold text-purple-800 mb-3 text-center">Resumo Financeiro</h3>
        
        <div className="text-center mb-4">
            <p className="text-md text-gray-700">Valor Total do Orçamento (À Vista):</p>
            <p className="text-3xl font-bold text-purple-700">{formatCurrency(estimate.finalDiscountedPrice)}</p>
             <p className="text-xs text-gray-500 mt-1">
                (Custo dos equipamentos com desconto aplicado)
                {estimate.appliedDiscountDescription && <span className="block text-purple-600 text-xs mt-0.5">Detalhe Desconto: {estimate.appliedDiscountDescription}</span>}
            </p>
        </div>

        <hr className="my-4 border-purple-200"/>

        <p className="text-md font-semibold text-gray-700 mb-2">Forma de Pagamento Escolhida: <span className="font-bold text-purple-600">{isCartao ? 'Cartão de Crédito' : 'À Vista'}</span></p>

        {isCartao && estimate.selectedTermDescription && (
          <div className="mt-4 bg-white p-4 rounded-md border border-gray-200 shadow-sm">
            <h4 className="text-lg font-medium text-gray-800 mb-2">Detalhes do Financiamento:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li><strong>Condição:</strong> {estimate.selectedTermDescription}</li>
              <li><strong>Taxa Aplicada:</strong> {(estimate.financingRate! * 100).toFixed(2)}%</li>
              <li><strong>Custo do Financiamento:</strong> {formatCurrency(estimate.financingCostValue)}</li>
              <li className="pt-2 border-t mt-2">
                <strong className="text-purple-700">Valor Total no Cartão:</strong> 
                <span className="font-bold text-xl ml-2 text-purple-700">{formatCurrency(estimate.totalPriceWithFinancing)}</span>
              </li>
              <li><strong>Número de Parcelas:</strong> {estimate.installments}x</li>
              <li><strong>Valor da Parcela:</strong> <span className="font-semibold">{formatCurrency(estimate.installmentValue)}</span></li>
            </ul>
          </div>
        )}

        {!isCartao && (
            <p className="text-center text-xl font-bold text-purple-700 mt-4">
                Total à Vista: {formatCurrency(estimate.finalDiscountedPrice)}
            </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <button
          onClick={onReset}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-base"
        >
          Fazer Nova Simulação
        </button>
        <button
          onClick={onPrint}
          className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-base flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a8.956 8.956 0 0 1-1.006-2.03M6.72 13.829c.24.03.48.062-.72.096m1.006-2.03M6.72 13.829M6.72 13.829l-.384-.553A2.25 2.25 0 0 0 5.146 13H4.875c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h.271A2.25 2.25 0 0 0 5.146 16.5l.384-.553M16.5 13.5M16.5 13.5h-.271a1.125 1.125 0 0 0-1.146.829l-.384.553M16.5 13.5v1.5c0 .621.504 1.125 1.125 1.125h.271a2.25 2.25 0 0 0 1.522-.671l.384-.553M16.5 13.5M19.5 15c-1.148 0-2.166-.321-3-1.006M19.5 15V9.75M19.5 15h-4.5M16.5 4.5c0-1.38.86-2.5 1.908-2.5H19.5A2.25 2.25 0 0 1 21.75 4.5v.75M16.5 4.5v1.5M16.5 4.5H12M12 10.5h3M12 10.5c-1.148 0-2.166-.321-3-1.006M12 10.5V15m0 0H9m3 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125H9.875c-.621 0-1.125-.504-1.125-1.125V15m1.5-1.5H2.625a1.125 1.125 0 0 0-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h2.625m0-1.5V6.75A2.25 2.25 0 0 1 5.25 4.5H9.75A2.25 2.25 0 0 1 12 6.75v1.5" />
          </svg>
          Imprimir Orçamento
        </button>
      </div>
      
      <div className="mt-10 text-xs text-gray-500 border-t border-gray-200 pt-4">
        <p><strong>Aviso Legal:</strong> Os valores apresentados são estimativas baseadas em médias de mercado e nas informações fornecidas. Um orçamento preciso requer uma análise técnica detalhada do local de instalação, consumo real e condições específicas. Preços, condições de financiamento e disponibilidade de equipamentos podem variar.</p>
      </div>
    </div>
  );
};

export default QuoteResult;
