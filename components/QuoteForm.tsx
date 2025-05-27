
import React, { useState, useEffect, useMemo } from 'react';
import { QuoteFormData, RoofType, SolarPanel, Inverter, CreditCardTerm, PaymentType } from '../types';
import { ROOF_TYPE_OPTIONS } from '../constants';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string | number;
  error?: string;
  isRequired?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  min?: string | number;
  step?: string | number;
  children?: React.ReactNode;
  disabled?: boolean;
  subText?: string;
  warningText?: string; // For immediate validation warnings
}

const InputField: React.FC<InputFieldProps> = ({
  label, name, type = 'text', placeholder, value, error, isRequired = false, onChange, min, step, children, disabled = false, subText, warningText
}) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <div className="relative rounded-md shadow-sm">
      {children}
      <input
        type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder}
        min={min} step={step} disabled={disabled}
        className={`w-full py-3 px-4 border ${(error || warningText) ? 'border-red-500' : 'border-gray-300'} rounded-md focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out ${children ? 'pl-10' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        aria-describedby={error ? `${name}-error` : (warningText ? `${name}-warning` : undefined)} required={isRequired}
      />
    </div>
    {subText && !error && !warningText && <p className="mt-1 text-xs text-gray-500">{subText}</p>}
    {warningText && <p id={`${name}-warning`} className="mt-1 text-xs text-red-600">{warningText}</p>}
    {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);

interface SelectFieldProps<T> {
  label: string;
  name: string;
  value: string;
  error?: string;
  isRequired?: boolean;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: T[];
  getOptionValue: (option: T) => string;
  getOptionLabel: (option: T) => string;
  disabled?: boolean;
  defaultOptionLabel?: string;
  subText?: string;
  warningText?: string; // For immediate validation warnings
}

const SelectField = <T extends object>({
  label, name, value, error, isRequired = false, onChange, options,
  getOptionValue, getOptionLabel, disabled = false, defaultOptionLabel = "Selecione...", subText, warningText
}: SelectFieldProps<T>) => (
  <div className="mb-6">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name} name={name} value={value} onChange={onChange} disabled={disabled}
      className={`w-full py-3 px-4 border ${(error || warningText) ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 transition duration-150 ease-in-out ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
      required={isRequired}
      aria-describedby={error ? `${name}-error` : (warningText ? `${name}-warning` : undefined)}
    >
      <option value="">{defaultOptionLabel}</option>
      {options.map((option) => (
        <option key={getOptionValue(option)} value={getOptionValue(option)}>{getOptionLabel(option)}</option>
      ))}
    </select>
    {subText && !error && !warningText && <p className="mt-1 text-xs text-gray-500">{subText}</p>}
    {warningText && <p id={`${name}-warning`} className="mt-1 text-xs text-red-600">{warningText}</p>}
    {error && <p id={`${name}-error`} className="mt-1 text-xs text-red-600">{error}</p>}
  </div>
);


interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6 border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 focus:outline-none rounded-t-lg"
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
        <svg className={`w-6 h-6 text-gray-600 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};


interface QuoteFormProps {
  onSubmit: (data: QuoteFormData) => void;
  isLoading: boolean;
  solarPanelOptions: SolarPanel[];
  /** This prop should contain only inverters of type 'micro' */
  microInverterOptions: Inverter[]; 
  creditCardTermOptions: CreditCardTerm[];
}

const initialFormData: QuoteFormData = {
  name: '',
  email: '',
  phone: '',
  installationCity: '',
  roofType: RoofType.METAL, 
  selectedPanelId: '',
  numberOfPanels: 10,
  selectedMicroInverterId: '',
  paymentType: 'avista',
  selectedCreditCardTermId: '',
};

const QuoteForm: React.FC<QuoteFormProps> = ({ 
    onSubmit, isLoading,
    solarPanelOptions, 
    microInverterOptions, // Directly use this prop as it's already filtered microinverters
    creditCardTermOptions
}) => {
  const [formData, setFormData] = useState<QuoteFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof QuoteFormData, string>>>({});
  const [filteredSolarPanels, setFilteredSolarPanels] = useState<SolarPanel[]>([]);
  
  useEffect(() => {
    if (!formData.selectedMicroInverterId) {
      setFilteredSolarPanels([]);
      if (formData.selectedPanelId) {
        setFormData(prevFormData => ({ ...prevFormData, selectedPanelId: '' }));
      }
      return;
    }

    const selectedMicro = microInverterOptions.find(inv => inv.id === formData.selectedMicroInverterId);
    let newFilteredPanels: SolarPanel[];

    if (selectedMicro) {
      if (selectedMicro.id === 'inv-weg-siw100g-m010') {
        newFilteredPanels = solarPanelOptions.filter(panel => panel.powerWp <= 630);
      } else {
        newFilteredPanels = [...solarPanelOptions]; // All panels for other micros
      }
    } else {
      newFilteredPanels = []; // No micro found or data inconsistency
    }

    setFilteredSolarPanels(newFilteredPanels);

    if (formData.selectedPanelId) {
      const isSelectedPanelStillValid = newFilteredPanels.some(panel => panel.id === formData.selectedPanelId);
      if (!isSelectedPanelStillValid) {
        setFormData(prevFormData => ({ ...prevFormData, selectedPanelId: '' }));
      }
    }
  }, [
    formData.selectedMicroInverterId,
    formData.selectedPanelId,
    solarPanelOptions,
    microInverterOptions, // Prop containing microinverters
    setFormData // Include setFormData as it's used
  ]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | RoofType | PaymentType = value;
    if (type === 'number' || name === 'numberOfPanels') {
      processedValue = parseFloat(value) || 0;
       if (name === 'numberOfPanels' && processedValue < 0) processedValue = 0;
    } else if (name === 'roofType') {
      processedValue = value as RoofType;
    } else if (name === 'paymentType') {
        processedValue = value as PaymentType;
        if (value === 'avista') {
            // Use functional update for nested setFormData as well if it depended on previous state
            setFormData(prev => ({ ...prev, selectedCreditCardTermId: ''}));
        }
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear errors for the field being changed
    if (errors[name as keyof QuoteFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof QuoteFormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório.';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido.';
    
    if (!formData.installationCity.trim()) newErrors.installationCity = 'Cidade de Instalação é obrigatória.';

    if (!formData.selectedMicroInverterId) newErrors.selectedMicroInverterId = 'Selecione um modelo de microinversor.';
    if (!formData.roofType) newErrors.roofType = 'Selecione o tipo de telhado.';
    if (!formData.selectedPanelId) newErrors.selectedPanelId = 'Selecione um modelo de painel.';
    if (!formData.numberOfPanels || formData.numberOfPanels <= 0) newErrors.numberOfPanels = 'Número de painéis deve ser maior que zero.';
    
    if (formData.paymentType === 'cartao' && !formData.selectedCreditCardTermId) {
        newErrors.selectedCreditCardTermId = 'Selecione uma condição de parcelamento.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };
  
  const microInverterSubText = useMemo(() => {
    if (!formData.selectedMicroInverterId) return "Selecione para ver painéis compatíveis e definir a quantidade.";
    
    const micro = microInverterOptions.find(i => i.id === formData.selectedMicroInverterId);
    if (micro && formData.selectedPanelId && formData.numberOfPanels && formData.numberOfPanels > 0) {
        const numMicros = Math.ceil((formData.numberOfPanels || 0) / (micro.maxPanelsPerMicro || 2)); // Guard against micro.maxPanelsPerMicro being 0
        return `Para ${formData.numberOfPanels} painéis, serão necessários ${numMicros} unidade(s) de ${micro.name} (considerando ${micro.maxPanelsPerMicro || 2} painel/micro).`;
    }
    return `Painéis compatíveis com ${micro?.name || 'o microinversor selecionado'} serão listados abaixo.`;
  }, [formData.selectedMicroInverterId, formData.selectedPanelId, formData.numberOfPanels, microInverterOptions]);


  return (
    <form onSubmit={handleSubmit} className="p-6 sm:p-8 bg-white shadow-2xl rounded-xl">
      <CollapsibleSection title="1. Informações de Contato e Local" defaultOpen={true}>
        <InputField label="Nome Completo" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Seu nome completo" isRequired />
        <InputField label="Email Principal" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="exemplo@email.com" isRequired />
        <InputField label="Telefone / WhatsApp (Opcional)" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} error={errors.phone} placeholder="(XX) XXXXX-XXXX" />
        <InputField 
          label="Cidade de Instalação" 
          name="installationCity" 
          value={formData.installationCity} 
          onChange={handleChange} 
          error={errors.installationCity} 
          placeholder="Ex: São Paulo, SP" 
          isRequired 
        />
      </CollapsibleSection>

      <CollapsibleSection title="2. Configuração do Sistema Solar (Microinversores)" defaultOpen={true}>
        <h4 className="text-md font-semibold text-gray-600 mb-2 mt-4 border-b pb-1">Equipamentos Principais</h4>
        <SelectField
          label="Modelo do Microinversor" name="selectedMicroInverterId" value={formData.selectedMicroInverterId || ''}
          onChange={handleChange} error={errors.selectedMicroInverterId} isRequired
          options={microInverterOptions} 
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => `${opt.name} (${opt.powerKw}kW - ${opt.maxPanelsPerMicro || 2} painel/micro)`}
          subText={microInverterSubText}
          defaultOptionLabel="Selecione o microinversor"
        />
        <SelectField
          label="Tipo de Telhado Predominante" name="roofType" value={formData.roofType}
          onChange={handleChange} error={errors.roofType} isRequired
          options={ROOF_TYPE_OPTIONS}
          getOptionValue={opt => opt.value}
          getOptionLabel={opt => opt.label}
          disabled={!formData.selectedMicroInverterId}
          defaultOptionLabel={!formData.selectedMicroInverterId ? "Selecione o microinversor primeiro" : "Selecione o tipo de telhado"}
        />
        <SelectField
          label="Modelo do Painel Solar" name="selectedPanelId" value={formData.selectedPanelId || ''}
          onChange={handleChange} error={errors.selectedPanelId} isRequired
          options={filteredSolarPanels}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => `${opt.name} (${opt.powerWp}Wp)`}
          disabled={!formData.selectedMicroInverterId}
          defaultOptionLabel={
            !formData.selectedMicroInverterId 
              ? "Selecione um microinversor primeiro" 
              : (filteredSolarPanels.length === 0 ? "Nenhum painel compatível" : "Selecione o painel...")
          }
        />
        <InputField 
          label="Quantidade de Painéis" 
          name="numberOfPanels" 
          type="number" 
          value={formData.numberOfPanels === 0 ? '' : formData.numberOfPanels || ''} 
          onChange={handleChange} 
          error={errors.numberOfPanels} 
          isRequired 
          min="1" 
          disabled={!formData.selectedMicroInverterId || !formData.selectedPanelId}
        />
        
        <p className="text-xs text-gray-500 mt-6 mb-4">
            Os demais componentes (estruturas, cabos AC, conectores AC, suportes dos micros, DPS e Disjuntores) serão calculados automaticamente com base nas suas seleções.
        </p>
      </CollapsibleSection>

      <CollapsibleSection title="3. Forma de Pagamento" defaultOpen={true}>
         <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Pagamento</label>
            <div className="flex items-center space-x-6">
                <label htmlFor="avista" className="flex items-center cursor-pointer">
                    <input 
                        type="radio" 
                        id="avista" 
                        name="paymentType" 
                        value="avista" 
                        checked={formData.paymentType === 'avista'} 
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">À Vista</span>
                </label>
                <label htmlFor="cartao" className="flex items-center cursor-pointer">
                    <input 
                        type="radio" 
                        id="cartao" 
                        name="paymentType" 
                        value="cartao" 
                        checked={formData.paymentType === 'cartao'} 
                        onChange={handleChange}
                        className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Cartão de Crédito</span>
                </label>
            </div>
         </div>

        {formData.paymentType === 'cartao' && (
            <SelectField
                label="Condição de Parcelamento"
                name="selectedCreditCardTermId"
                value={formData.selectedCreditCardTermId || ''}
                onChange={handleChange}
                error={errors.selectedCreditCardTermId}
                isRequired={true}
                options={creditCardTermOptions}
                getOptionValue={opt => opt.id}
                getOptionLabel={opt => `${opt.code} - ${opt.description} (+${(opt.costPercentage * 100).toFixed(2)}%)`}
                defaultOptionLabel="Selecione a condição..."
            />
        )}
      </CollapsibleSection>


      <button
        type="submit"
        disabled={isLoading}
        className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center text-lg"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Calculando...
          </>
        ) : (
          'Calcular Orçamento Detalhado'
        )}
      </button>
    </form>
  );
};

export default QuoteForm;
