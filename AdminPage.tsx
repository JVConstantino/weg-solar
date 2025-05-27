
import React, { useState, useEffect } from 'react';
import { 
    SolarPanel, Inverter, MountingStructure, Cable, SurgeProtector, CircuitBreaker, 
    ACConnector, InverterSupport, AdminViewType, AppComponentTypes, RoofType, RegionalPrice, 
    CreditCardTerm, Integrator, ArchivedQuote, QuoteFormData, QuoteEstimate // Added ArchivedQuote
} from '../types';
import { DISCOUNT_FACTOR_A, INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP } from '../constants';


// Helper to generate a unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

interface ComponentDataProps {
  solarPanels: SolarPanel[];
  inverters: Inverter[];
  mountingStructures: MountingStructure[];
  cables: Cable[];
  surgeProtectors: SurgeProtector[];
  circuitBreakers: CircuitBreaker[];
  acConnectors: ACConnector[];
  inverterSupports: InverterSupport[];
  creditCardTerms: CreditCardTerm[];
  integrators: Integrator[];
  archivedQuotes: ArchivedQuote[]; // Added
}

interface ComponentSetterProps {
  setSolarPanels: React.Dispatch<React.SetStateAction<SolarPanel[]>>;
  setInverters: React.Dispatch<React.SetStateAction<Inverter[]>>;
  setMountingStructures: React.Dispatch<React.SetStateAction<MountingStructure[]>>;
  setCables: React.Dispatch<React.SetStateAction<Cable[]>>;
  setSurgeProtectors: React.Dispatch<React.SetStateAction<SurgeProtector[]>>;
  setCircuitBreakers: React.Dispatch<React.SetStateAction<CircuitBreaker[]>>;
  setAcConnectors: React.Dispatch<React.SetStateAction<ACConnector[]>>;
  setInverterSupports: React.Dispatch<React.SetStateAction<InverterSupport[]>>;
  setCreditCardTerms: React.Dispatch<React.SetStateAction<CreditCardTerm[]>>;
  setIntegrators: React.Dispatch<React.SetStateAction<Integrator[]>>;
  setArchivedQuotes: React.Dispatch<React.SetStateAction<ArchivedQuote[]>>; // Added
}

interface AdminPageProps {
  componentData: ComponentDataProps;
  componentSetters: ComponentSetterProps;
  selectedView: AdminViewType;
  setSelectedView: (view: AdminViewType) => void;
  onExitAdmin: () => void;
}

type EditableComponent = SolarPanel | Inverter | MountingStructure | Cable | SurgeProtector | CircuitBreaker | ACConnector | InverterSupport | CreditCardTerm | Integrator | ArchivedQuote;


interface FormModalProps<T extends EditableComponent & { id: string }> {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: T) => void;
  itemToEdit: T | null;
  itemType: AdminViewType; 
  defaultItem: T; 
  isReadOnly?: boolean; // Added for ArchivedQuotes
}

// Helper function to find the secondary factor that most closely matches a final multiplier
const findClosestSecondaryFactor = (
    finalMultiplier: number, 
    baseFactorA: number, 
    secondaryFactorsMap: { [key: string]: number }
): number => {
    let closestSecondary = parseFloat(Object.values(secondaryFactorsMap)[0].toString());
    let smallestDifference = Infinity;

    if (baseFactorA === 0) { // Avoid division by zero if baseFactorA is 0
        return closestSecondary; // Return the default/first secondary factor
    }

    for (const factorValue of Object.values(secondaryFactorsMap)) {
        const secondary = parseFloat(factorValue.toString());
        const calculatedFinal = baseFactorA * secondary;
        const difference = Math.abs(finalMultiplier - calculatedFinal);

        if (difference < smallestDifference) {
            smallestDifference = difference;
            closestSecondary = secondary;
        }
    }
    // Tolerance for floating point comparisons
    if (smallestDifference > 0.000001 && finalMultiplier !== 0) {
      console.warn(`AdminPage: Could not precisely match finalMultiplier ${finalMultiplier} (target secondary: ${finalMultiplier/baseFactorA}). Defaulting to closest: ${closestSecondary}.`);
    }
    return closestSecondary;
};


const getFieldType = (key: string, itemTypeForField: AdminViewType | null): string => {
  const numericFields = [
    'powerWp', 'powerKw', 'panelsPerUnit', 'lengthMetersPerUnit', 'amps', 'poles', 
    'maxPanelsPerMicro', 'areaM2', 'numberOfCells', 'mpptInputs', 'maxPanelPowerWpInput',
    'windSpeedRatingMps', 'crossSectionalAreaMm2', 'efficiency',
    'costPercentage', 'numberOfInstallments' 
  ];
  if (numericFields.includes(key)) return 'number';
  if (key === 'price' && (itemTypeForField === 'panels' || itemTypeForField === 'inverters')) return 'regionalPrice';
  if (key === 'price') return 'number';

  if (key === 'compatibleRoofTypes' && itemTypeForField === 'structures') return 'multiselect-rooftype';
  if (key === 'type' && itemTypeForField === 'inverters') return 'select-inverter-type';
  if (key === 'phase' && itemTypeForField === 'inverters') return 'select-inverter-phase';
  if (key === 'type' && itemTypeForField === 'protectors') return 'select-protector-type';
  if (key === 'color' && itemTypeForField === 'cables') return 'select-cable-color';
  if (key === 'isAcCable' && itemTypeForField === 'cables') return 'checkbox';
  
  if (key === 'integratorDiscountValue' && itemTypeForField === 'integrators') return 'select-integrator-secondary-factor';
  if (key === 'password' && itemTypeForField === 'integrators') return 'password';

  if (itemTypeForField === 'archivedQuotes') {
    if (key === 'formData' || key === 'estimate') return 'json-display';
    return 'readonly-text'; // Default for archived quote fields
  }


  if (['notes', 'extendedWarrantyInfo', 'stringBoxInfo', 'compatibilityNote', 'description'].includes(key) && itemTypeForField !== 'creditCardTerms') return 'textarea';
  if (key === 'description' && itemTypeForField === 'creditCardTerms') return 'text'; 

  return 'text';
};


const FormModal = <T extends EditableComponent & { id: string; }> ({ isOpen, onClose, onSave, itemToEdit, itemType, defaultItem, isReadOnly = false }: FormModalProps<T>) => {
  const [formData, setFormData] = useState<T>(itemToEdit || { ...defaultItem, id: generateId()});

  useEffect(() => {
     const initialItemName = (defaultItem as any).name || (defaultItem as any).code || (defaultItem as any).username || '';
     
     let baseFormData = itemToEdit 
        ? { ...defaultItem, ...itemToEdit } 
        : { ...defaultItem, id: generateId() };
    
    if ('name' in defaultItem && !('name' in baseFormData && baseFormData.name)) (baseFormData as any).name = initialItemName;
    if ('username' in defaultItem && !('username' in baseFormData && baseFormData.username)) (baseFormData as any).username = initialItemName;
    if ('quoteNumber' in defaultItem && !('quoteNumber'in baseFormData && (baseFormData as any).quoteNumber)) (baseFormData as any).quoteNumber = '';


    if (getFieldType('price', itemType) === 'regionalPrice' && 'price' in baseFormData) {
        const currentPrice = (baseFormData as SolarPanel | Inverter).price;
        if (typeof currentPrice !== 'object' || currentPrice === null) {
            const numericPrice = typeof currentPrice === 'number' ? currentPrice : 0;
            (baseFormData as SolarPanel | Inverter).price = { sudeste: numericPrice, sul: undefined, centroOeste: undefined, norte: undefined, nordeste: undefined };
        } else {
             (baseFormData as SolarPanel | Inverter).price = {
                sudeste: currentPrice.sudeste ?? 0,
                sul: currentPrice.sul ?? undefined,
                centroOeste: currentPrice.centroOeste ?? undefined,
                norte: currentPrice.norte ?? undefined,
                nordeste: currentPrice.nordeste ?? undefined,
            };
        }
    }
    
    if (itemType === 'integrators') {
        let secondaryFactorForForm: number;
        if (itemToEdit) {
            secondaryFactorForForm = findClosestSecondaryFactor(
                (itemToEdit as Integrator).integratorDiscountValue,
                DISCOUNT_FACTOR_A,
                INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP
            );
        } else {
            secondaryFactorForForm = parseFloat(Object.values(INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP)[0].toString());
        }
        (baseFormData as any).integratorDiscountValue = secondaryFactorForForm;
    }

    if (itemType === 'archivedQuotes' && baseFormData) {
        const archived = baseFormData as ArchivedQuote;
        (baseFormData as any).formDataDisplay = JSON.stringify(archived.formData, null, 2);
        (baseFormData as any).estimateDisplay = JSON.stringify(archived.estimate, null, 2);
    }


    setFormData(baseFormData as T);
  }, [itemToEdit, defaultItem, isOpen, itemType]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'number' || name === 'costPercentage' || name === 'numberOfInstallments') { 
      processedValue = parseFloat(value) || 0;
       if (name === 'costPercentage') processedValue = parseFloat(value)/100 || 0; 
    } else if (name === 'integratorDiscountValue') { // This is now the secondary factor
        processedValue = parseFloat(value) || 0;
    } else if (name.startsWith('price.')) { 
        const region = name.split('.')[1] as keyof RegionalPrice;
        setFormData(prev => {
            const prevPrice = (prev as any).price as RegionalPrice | undefined;
            const newPrice = { ...(prevPrice || defaultRegionalPrice), [region]: parseFloat(value) || undefined };
             if(newPrice[region] === 0 && region !== 'sudeste') newPrice[region] = undefined; 
            return { ...prev, price: newPrice as any };
        });
        return;
    } else if (name === 'compatibleRoofTypes' && e.target instanceof HTMLSelectElement) { 
        processedValue = Array.from((e.target as HTMLSelectElement).selectedOptions, option => option.value as RoofType);
    } else if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
        processedValue = e.target.checked;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      onClose();
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  const renderField = (key: string, value: any) => {
    const fieldType = getFieldType(key, itemType); 
    const commonProps: any = {
        id: key,
        name: key,
        onChange: handleChange,
        className: `mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${isReadOnly || (key === 'id' && itemToEdit) ? 'bg-gray-100 cursor-not-allowed' : ''}`,
        disabled: isReadOnly || (key === 'id' && itemToEdit),
    };

    if (key === 'id' && itemToEdit) {
        return <input {...commonProps} type="text" value={value} readOnly aria-label={key}/>;
    }
    if (key === 'id' && !itemToEdit) { 
        return null;
    }
    
    if (key === 'price' && (itemType === 'creditCardTerms' || itemType === 'integrators' || itemType === 'archivedQuotes')) {
        return null;
    }
    if ((key === 'formData' || key === 'estimate') && itemType !== 'archivedQuotes') {
        return null; // Don't show these raw fields unless it's an archived quote view
    }
    if (fieldType === 'json-display') {
        return <pre className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-xs overflow-auto max-h-48">{value ? JSON.stringify(value, null, 2) : 'N/A'}</pre>;
    }
    if (fieldType === 'readonly-text') {
        return <input {...commonProps} type="text" value={value || ''} readOnly aria-label={key}/>;
    }


    if (fieldType === 'regionalPrice') {
        const currentPriceObj = (value || { ...defaultRegionalPrice }) as RegionalPrice;
        return (
            <div className="space-y-2 p-2 border rounded-md">
                <h4 className="text-xs font-medium text-gray-500">Preços Regionais (R$)</h4>
                {(Object.keys(defaultRegionalPrice) as Array<keyof RegionalPrice>).map(regionKey => ( 
                     <div key={regionKey} className="flex items-center">
                        <label htmlFor={`price.${regionKey}`} className="w-1/3 text-xs text-gray-600 capitalize">{regionKey.replace(/([A-Z])/g, ' $1')}:</label>
                        <input 
                            type="number" 
                            id={`price.${regionKey}`} 
                            name={`price.${regionKey}`} 
                            value={currentPriceObj[regionKey] ?? ''}
                            onChange={handleChange}
                            step="0.01"
                            className={`mt-1 block w-2/3 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs ${isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                            placeholder={regionKey === 'sudeste' ? "0.00 (Obrigatório)" : "Opcional"}
                            disabled={isReadOnly}
                        />
                    </div>
                ))}
            </div>
        );
    }
    
    if (fieldType === 'checkbox') {
        return <input {...commonProps} type="checkbox" checked={!!value} className={`h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 ${isReadOnly ? 'cursor-not-allowed' : ''}`} aria-label={key} />;
    }

    if (fieldType === 'textarea') {
      return <textarea {...commonProps} value={value || ''} rows={3} aria-label={key}></textarea>;
    }
    
    let valToSet = value;
    if(key === 'costPercentage' && typeof value === 'number') valToSet = (value * 100).toFixed(2); 

    commonProps.value = valToSet ?? (fieldType === 'number' || fieldType === 'select-integrator-secondary-factor' ? 0 : (fieldType === 'multiselect-rooftype' ? [] : ''));
    if(fieldType === 'password') commonProps.value = value || ''; 

    if (fieldType === 'select-inverter-type') {
        return (
            <select {...commonProps} value={value || 'micro'} aria-label={key}>
                <option value="micro">Micro</option>
                <option value="string">String</option>
                <option value="bombeamento">Bombeamento</option>
            </select>
        );
    }
     if (fieldType === 'select-protector-type') {
        return (
            <select {...commonProps} value={value || 'CA'} aria-label={key}>
                <option value="CA">CA</option>
                <option value="CC">CC</option>
                <option value="Híbrido">Híbrido</option>
            </select>
        );
    }
    if (fieldType === 'select-inverter-phase') {
         return (
            <select {...commonProps} value={value || 'monofasico'} aria-label={key}>
                <option value="monofasico">Monofásico</option>
                <option value="trifasico">Trifásico</option>
                <option value="bombeamento">Bombeamento</option>
            </select>
        );
    }
    if (fieldType === 'select-cable-color') {
        return (
            <select {...commonProps} value={value || 'conjunto'} aria-label={key}>
                <option value="vermelho">Vermelho (CC)</option>
                <option value="preto">Preto (CC)</option>
                <option value="conjunto">Conjunto (CC Vm/Pt)</option>
                <option value="ac_trunk">Cabo Tronco AC (Micro)</option>
                <option value="geral_ca">Cabo CA Geral</option>
            </select>
        );
    }
     if (fieldType === 'multiselect-rooftype') {
        const roofTypeValues: RoofType[] = Object.values(RoofType);
        return (
             <select {...commonProps} multiple value={value || []} size={Math.min(roofTypeValues.length, 5)} aria-label={key}>
                {roofTypeValues.map(rt => <option key={rt} value={rt}>{rt}</option>)}
            </select>
        );
    }
    if (fieldType === 'select-integrator-secondary-factor') {
        // 'value' for this field in formData is the secondary factor
        const currentSecondaryFactor = typeof value === 'number' ? value : parseFloat(Object.values(INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP)[0].toString());
        return (
            <select 
                {...commonProps} 
                value={currentSecondaryFactor.toString()}
                aria-label={key}
            >
                {Object.entries(INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP).map(([label, secondaryFactorVal]) => {
                    const finalCalcValue = DISCOUNT_FACTOR_A * secondaryFactorVal;
                    return (
                        <option key={label} value={secondaryFactorVal.toString()}>
                            {label} (Mult. Final: {finalCalcValue.toFixed(6)})
                        </option>
                    );
                })}
            </select>
        );
    }

    const inputType = fieldType === 'number' ? 'number' : (fieldType === 'password' ? 'password' : 'text');
    return <input {...commonProps} type={inputType} step={inputType === 'number' ? 'any' : undefined} aria-label={key} placeholder={fieldType === 'password' && itemToEdit ? 'Deixe em branco para não alterar' : ''}/>;
  };

  const modalTitle = isReadOnly 
    ? `Visualizar ${itemType ? (views.find(v => v.key === itemType)?.labelSingular || 'Item') : 'Item'}`
    : `${itemToEdit ? 'Editar' : 'Adicionar'} ${itemType ? (views.find(v => v.key === itemType)?.labelSingular || itemType.slice(0, -1).replace(/s$/, '')) : 'Item'}`;


  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center" role="dialog" aria-modal="true" aria-labelledby="formModalTitle">
      <div className="relative mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <h3 id="formModalTitle" className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {modalTitle}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {Object.keys(defaultItem).map((key) => { 
            if (key === 'id' && !itemToEdit && itemType !== 'archivedQuotes') return null; 
            if (itemType === 'archivedQuotes' && (key === 'formData' || key === 'estimate')) {
                 // Render formData and estimate as JSON for archived quotes view
                 return (
                     <div key={key}>
                         <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">{key}</label>
                         {renderField(key, (formData as ArchivedQuote)[key as keyof ArchivedQuote])}
                     </div>
                 );
            }
            // Skip 'id' for new items (except for archived quotes which always have one)
            if (key === 'id' && !itemToEdit && itemType !== 'archivedQuotes') return null;


            let fieldLabel = key.replace(/([A-Z0-9])/g, ' $1').replace(/^ /, '');
            if (key === 'integratorDiscountValue' && itemType === 'integrators') {
                fieldLabel = 'Nível de Desconto do Integrador (Fator Secundário)';
            }

             return (
                <div key={key}>
                    <label htmlFor={key} className="block text-sm font-medium text-gray-700 capitalize">{fieldLabel}</label> 
                    {renderField(key, (formData as any)[key])}
                    {key === 'costPercentage' && !isReadOnly && <p className="text-xs text-gray-500">Informe a taxa como porcentagem (ex: 2.91 para 2.91%).</p>}
                    {key === 'password' && itemToEdit && !isReadOnly && <p className="text-xs text-gray-500">Deixe em branco para não alterar a senha.</p>}
                    {key === 'integratorDiscountValue' && itemType === 'integrators' && !isReadOnly && <p className="text-xs text-gray-500">Selecione o fator secundário. O multiplicador final (Base * Secundário) será calculado e armazenado.</p>}
                </div>
            );
          })}
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
              {isReadOnly ? 'Fechar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Salvar</button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

const defaultRegionalPrice: RegionalPrice = { sudeste: 0, sul: undefined, centroOeste: undefined, norte: undefined, nordeste: undefined };
const defaultDummyFormData: QuoteFormData = { name: '', email: '', roofType: RoofType.METAL, installationCity: '', paymentType: 'avista' };
const defaultDummyEstimate: QuoteEstimate = { finalDiscountedPrice: 0 };


type ViewConfigBase<K extends AdminViewType, T extends AppComponentTypes, CK extends keyof ComponentDataProps> = {
  key: K;
  componentDataKey: CK; 
  label: string;
  labelSingular: string;
  defaultItem: T;
  displayColumns?: Array<keyof T | string>; // Allow string for custom/nested paths
  disableAdd?: boolean; // To disable "Add New" for views like ArchivedQuotes
};

type PanelViewConfig = ViewConfigBase<'panels', SolarPanel, 'solarPanels'>;
type InverterViewConfig = ViewConfigBase<'inverters', Inverter, 'inverters'>;
type StructureViewConfig = ViewConfigBase<'structures', MountingStructure, 'mountingStructures'>;
type CableViewConfig = ViewConfigBase<'cables', Cable, 'cables'>;
type ProtectorViewConfig = ViewConfigBase<'protectors', SurgeProtector, 'surgeProtectors'>;
type BreakerViewConfig = ViewConfigBase<'breakers', CircuitBreaker, 'circuitBreakers'>;
type ACConnectorViewConfig = ViewConfigBase<'acConnectors', ACConnector, 'acConnectors'>;
type InverterSupportViewConfig = ViewConfigBase<'inverterSupports', InverterSupport, 'inverterSupports'>;
type CreditCardTermViewConfig = ViewConfigBase<'creditCardTerms', CreditCardTerm, 'creditCardTerms'>;
type IntegratorViewConfig = ViewConfigBase<'integrators', Integrator, 'integrators'>;
type ArchivedQuoteViewConfig = ViewConfigBase<'archivedQuotes', ArchivedQuote, 'archivedQuotes'>;


type AnyAdminViewConfig = 
  | PanelViewConfig 
  | InverterViewConfig 
  | StructureViewConfig 
  | CableViewConfig 
  | ProtectorViewConfig 
  | BreakerViewConfig 
  | ACConnectorViewConfig 
  | InverterSupportViewConfig
  | CreditCardTermViewConfig
  | IntegratorViewConfig
  | ArchivedQuoteViewConfig; // Added

// Calculate the default final multiplier for integrators based on the first secondary factor
const getDefaultIntegratorFinalDiscountValue = (): number => {
    const firstSecondaryFactor = parseFloat(Object.values(INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP)[0].toString());
    return DISCOUNT_FACTOR_A * firstSecondaryFactor;
};


const views: AnyAdminViewConfig[] = [ 
    { 
      key: 'panels', componentDataKey: 'solarPanels', label: 'Painéis Solares', labelSingular: 'Painel Solar',
      defaultItem: {id: '', sapCode: '', name: '', brand: '', modelName: '', powerWp: 0, price: {...defaultRegionalPrice}, cellType: '', areaM2: 0, numberOfCells: 0, efficiency: 0, notes: ''} as SolarPanel,
      displayColumns: ['sapCode', 'name', 'brand', 'modelName', 'powerWp', 'price', 'efficiency']
    },
    { 
      key: 'inverters', componentDataKey: 'inverters', label: 'Inversores', labelSingular: 'Inversor',
      defaultItem: {id: '', sapCode: '', name: '', brand: '', modelName: '', powerKw: 0, price: {...defaultRegionalPrice}, phase: 'monofasico', type: 'micro', maxPanelsPerMicro:2, voltage: '', mpptInputs:0, recommendedBreakerModel:'', stringBoxInfo:'', extendedWarrantyInfo:'', maxPanelPowerWpInput:0, notes:''} as Inverter,
      displayColumns: ['sapCode', 'name', 'brand', 'modelName', 'powerKw', 'type', 'price', 'maxPanelsPerMicro']
    },
    { 
      key: 'structures', componentDataKey: 'mountingStructures', label: 'Estruturas', labelSingular: 'Estrutura',
      defaultItem: {id: '', sapCode: '', name: '', panelsPerUnit: 0, compatibleRoofTypes: [], price: 0, material: '', brand:'', roofRegion: '', profileType:'', windSpeedRatingMps:0, notes:''} as MountingStructure,
      displayColumns: ['sapCode', 'name', 'panelsPerUnit', 'price', 'brand', 'compatibleRoofTypes', 'material']
    },
    { 
      key: 'cables', componentDataKey: 'cables', label: 'Cabos', labelSingular: 'Cabo',
      defaultItem: {id: '', sapCode: '', name: '', lengthMetersPerUnit: 0, price: 0, color: 'conjunto', isAcCable: false, crossSectionalAreaMm2:0, notes:''} as Cable,
      displayColumns: ['sapCode', 'name', 'price', 'isAcCable', 'crossSectionalAreaMm2', 'color']
    },
    { 
      key: 'protectors', componentDataKey: 'surgeProtectors', label: 'Protetores Surto (DPS)', labelSingular: 'Protetor Surto (DPS)',
      defaultItem: {id: '', sapCode: '', name: '', type: 'CA', price: 0, voltageRating:'', currentRatingKa:'', notes:''} as SurgeProtector,
      displayColumns: ['sapCode', 'name', 'type', 'price', 'voltageRating', 'currentRatingKa']
    },
    { 
      key: 'breakers', componentDataKey: 'circuitBreakers', label: 'Disjuntores', labelSingular: 'Disjuntor',
      defaultItem: {id: '', sapCode: '', name: '', amps: 0, poles: 0, price: 0, modelCode:'', notes:''} as CircuitBreaker,
      displayColumns: ['sapCode', 'name', 'modelCode', 'amps', 'poles', 'price']
    },
    { 
      key: 'acConnectors', componentDataKey: 'acConnectors', label: 'Conectores AC', labelSingular: 'Conector AC',
      defaultItem: {id: '', sapCode: '', name: '', price: 0, compatibilityNote:'', notes:''} as ACConnector,
      displayColumns: ['sapCode', 'name', 'price', 'compatibilityNote']
    },
    { 
      key: 'inverterSupports', componentDataKey: 'inverterSupports', label: 'Suportes Microinversor', labelSingular: 'Suporte Microinversor',
      defaultItem: {id: '', sapCode: '', name: '', price: 0, notes:''} as InverterSupport,
      displayColumns: ['sapCode', 'name', 'price', 'notes']
    },
    {
      key: 'creditCardTerms', componentDataKey: 'creditCardTerms', label: 'Condições Cartão Crédito', labelSingular: 'Condição Cartão Crédito',
      defaultItem: {id: '', code: '', description: '', costPercentage: 0, numberOfInstallments: 0} as CreditCardTerm,
      displayColumns: ['code', 'description', 'costPercentage', 'numberOfInstallments']
    },
    {
      key: 'integrators', componentDataKey: 'integrators', label: 'Integradores', labelSingular: 'Integrador',
      defaultItem: { 
          id: '', 
          username: '', 
          password: '', 
          displayName: '', 
          integratorDiscountValue: getDefaultIntegratorFinalDiscountValue() 
      } as Integrator,
      displayColumns: ['username', 'displayName', 'integratorDiscountValue']
    },
    {
      key: 'archivedQuotes', componentDataKey: 'archivedQuotes', label: 'Orçamentos Arquivados', labelSingular: 'Orçamento Arquivado',
      defaultItem: {
        id: '', quoteNumber: '', timestamp: new Date().toISOString(), 
        formData: defaultDummyFormData, 
        estimate: defaultDummyEstimate,
        generatedByRole: 'customer', 
      } as ArchivedQuote,
      displayColumns: ['quoteNumber', 'timestamp', 'formData.name', 'generatedByRole', 'integratorDisplayName', 'estimate.finalDiscountedPrice', 'estimate.totalPriceWithFinancing'],
      disableAdd: true,
    }
];

const AdminPage: React.FC<AdminPageProps> = ({ componentData, componentSetters, selectedView, setSelectedView, onExitAdmin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EditableComponent | null>(null);

  const currentViewDefinition = views.find(v => v.key === selectedView);
  
  let currentViewData: EditableComponent[] = [];
  if (selectedView && currentViewDefinition) {
      currentViewData = componentData[currentViewDefinition.componentDataKey as keyof ComponentDataProps] as EditableComponent[];
  }

  const currentViewSetters = (selectedView && currentViewDefinition)
    ? componentSetters[('set' + currentViewDefinition.componentDataKey.charAt(0).toUpperCase() + currentViewDefinition.componentDataKey.slice(1)) as keyof ComponentSetterProps] as React.Dispatch<React.SetStateAction<any[]>>
    : null;

  const currentDefaultItem = currentViewDefinition?.defaultItem as EditableComponent | undefined;


  const handleAddItem = () => {
    if (!currentDefaultItem || (currentViewDefinition && currentViewDefinition.disableAdd)) return; 
    setEditingItem(null); 
    setIsModalOpen(true);
  };

  const handleEditItem = (item: EditableComponent) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteItem = (itemId: string) => {
    if (!selectedView || !currentViewSetters) return;
    if (window.confirm('Tem certeza que deseja remover este item?')) {
      currentViewSetters(prev => prev.filter(item => item.id !== itemId));
    }
  };
  
 const handleSaveItem = (itemDataFromForm: EditableComponent) => {
    if (!selectedView || !currentViewSetters || !currentDefaultItem || !currentViewDefinition) return;
    if (currentViewDefinition.key === 'archivedQuotes') { // Archived quotes are read-only from form
        setIsModalOpen(false); setEditingItem(null); return;
    }

    let completeItemDraft: EditableComponent = {
        ...currentDefaultItem, 
        ...itemDataFromForm 
    };

    if (!completeItemDraft.id || (editingItem === null && completeItemDraft.id === currentDefaultItem.id)) {
        (completeItemDraft as any).id = generateId();
    }

    if (currentViewDefinition.key === 'panels' || currentViewDefinition.key === 'inverters') {
        const item = completeItemDraft as SolarPanel | Inverter;
        if (typeof item.price !== 'object' || item.price === null) {
            const numericPrice = typeof (item.price as any) === 'number' ? (item.price as any) : 0;
            item.price = { ...defaultRegionalPrice, sudeste: numericPrice };
        } else {
            item.price = { ...defaultRegionalPrice, ...item.price };
        }
        if (item.price.sudeste === undefined || item.price.sudeste === null || isNaN(item.price.sudeste)) {
            item.price.sudeste = 0;
        }
    } else if (currentViewDefinition.key !== 'creditCardTerms' && currentViewDefinition.key !== 'integrators') {
        // This block is for other component types like structures, cables, etc. that have a simple 'price' property.
        // It implicitly excludes 'archivedQuotes' because that case is handled by the early return.
        const item = completeItemDraft as Exclude<EditableComponent, CreditCardTerm | SolarPanel | Inverter | Integrator | ArchivedQuote>;
        if ('price' in item) {
          if (typeof (item as any).price !== 'number' || isNaN((item as any).price)) {
              (item as any).price = 0;
          }
        }
    } else if (currentViewDefinition.key === 'integrators') {
        const integratorItemToSave = completeItemDraft as Integrator;
        
        const selectedSecondaryFactor = parseFloat( (itemDataFromForm as Integrator).integratorDiscountValue.toString() ); 
        
        if (isNaN(selectedSecondaryFactor)) {
             console.error("Invalid secondary factor selected for integrator.");
             const firstSecondaryFactor = parseFloat(Object.values(INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP)[0].toString());
             integratorItemToSave.integratorDiscountValue = DISCOUNT_FACTOR_A * firstSecondaryFactor;
        } else {
             integratorItemToSave.integratorDiscountValue = DISCOUNT_FACTOR_A * selectedSecondaryFactor;
        }

        if (editingItem) { 
            const originalIntegrator = editingItem as Integrator; 
            const formSubmittedPassword = (itemDataFromForm as Integrator).password;

            if (originalIntegrator.id === integratorItemToSave.id) {
                if (!formSubmittedPassword || String(formSubmittedPassword).trim() === '') {
                    integratorItemToSave.password = originalIntegrator.password;
                }
            }
        }
    }

    const finalCompleteItem = completeItemDraft as EditableComponent;

    currentViewSetters(prev => {
        const existingIndex = prev.findIndex(i => i.id === finalCompleteItem.id);
        if (existingIndex > -1) {
            const updated = [...prev];
            updated[existingIndex] = finalCompleteItem;
            return updated;
        }
        return [...prev, finalCompleteItem];
    });
    setIsModalOpen(false);
    setEditingItem(null);
};


  const renderTable = () => {
    if (!selectedView || !currentViewDefinition || !currentViewData) {
      return <p className="text-gray-600 p-4">Selecione uma categoria ou adicione o primeiro item.</p>;
    }
    
    const dataToDisplay = currentViewData;
    const headers = (currentViewDefinition.displayColumns as string[]) || 
                    (currentDefaultItem ? Object.keys(currentDefaultItem) as string[] : 
                    (dataToDisplay.length > 0 ? Object.keys(dataToDisplay[0]) as string[] : []));
    
    if (headers.length === 0 && dataToDisplay.length === 0 && !currentDefaultItem) {
         return <p className="text-gray-600 p-4">Não foi possível determinar as colunas para esta categoria.</p>;
    }

    const getNestedValue = (obj: any, path: string): any => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const formatHeaderLabel = (headerKey: string): string => {
        let label = headerKey.replace(/([A-Z0-9])/g, ' $1').replace(/^ /, '');
        if (headerKey === 'sapCode') label = 'SAP';
        if (headerKey === 'integratorDiscountValue') label = 'Mult. Final Desconto';
        if (headerKey === 'quoteNumber') label = 'Nº Orçamento';
        if (headerKey === 'timestamp') label = 'Data';
        if (headerKey === 'formData.name') label = 'Cliente';
        if (headerKey === 'generatedByRole') label = 'Gerado Por';
        if (headerKey === 'integratorDisplayName') label = 'Integrador';
        if (headerKey === 'estimate.finalDiscountedPrice') label = 'Valor Final (À Vista)';
        if (headerKey === 'estimate.totalPriceWithFinancing') label = 'Valor Total (Cartão)';
        return label.trim();
    };


    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(headerKey => (
                <th key={headerKey} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider capitalize">
                    {formatHeaderLabel(headerKey)}
                </th>
              ))}
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dataToDisplay.map((item) => (
              <tr key={item.id}>
                {headers.map(headerKey => {
                  let cellValue: any = getNestedValue(item, headerKey);
                  
                  if (typeof cellValue === 'boolean') {
                    cellValue = cellValue ? 'Sim' : 'Não';
                  } else if (headerKey === 'price' && typeof cellValue === 'object' && cellValue !== null && 'sudeste' in cellValue) {
                    const regionalPrice = cellValue as RegionalPrice;
                    cellValue = `R$ ${(regionalPrice.sudeste ?? 0).toFixed(2)} (SE)${regionalPrice.sul !== undefined ? `, R$ ${regionalPrice.sul.toFixed(2)} (S)` : ''}`; 
                  } else if (typeof cellValue === 'number' && (String(headerKey).toLowerCase().includes('price') || String(headerKey).toLowerCase().includes('value') || String(headerKey) === 'unitPrice' || String(headerKey) === 'totalPrice')) {
                     cellValue = `R$ ${cellValue.toFixed(2)}`;
                  } else if (headerKey === 'costPercentage' && typeof cellValue === 'number') {
                    cellValue = `${(cellValue * 100).toFixed(2)}%`;
                  } else if (headerKey === 'integratorDiscountValue' && typeof cellValue === 'number') {
                    cellValue = cellValue.toFixed(6); 
                  } else if (headerKey === 'timestamp' && typeof cellValue === 'string') {
                    try {
                        cellValue = new Date(cellValue).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
                    } catch (e) { /* ignore, keep original string */ }
                  } else if (headerKey === 'generatedByRole' && typeof cellValue === 'string') {
                    cellValue = cellValue === 'integrator' ? 'Integrador' : 'Cliente';
                  }


                  const displayValue = Array.isArray(cellValue)
                                       ? cellValue.join(', ')
                                       : String(cellValue ?? 'N/A'); 
                  return (
                    <td key={`${item.id}-${String(headerKey)}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 max-w-xs truncate" title={displayValue}>
                      {displayValue}
                    </td>
                  );
                })}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button onClick={() => handleEditItem(item)} className="text-indigo-600 hover:text-indigo-900">
                     {currentViewDefinition?.key === 'archivedQuotes' ? 'Ver Detalhes' : 'Editar'}
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-900">Remover</button>
                </td>
              </tr>
            ))}
             {dataToDisplay.length === 0 && (
              <tr>
                <td colSpan={headers.length + 1} className="px-6 py-4 text-center text-sm text-gray-500">
                  Nenhum item nesta categoria. { !(currentViewDefinition && currentViewDefinition.disableAdd) && 'Clique em "Adicionar Novo" para começar.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
        <button 
          onClick={onExitAdmin}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Voltar ao Simulador
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <aside className="md:w-1/4 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Categorias</h2>
          <nav className="space-y-2">
            {views.map(view => (
              <button
                key={view.key}
                onClick={() => setSelectedView(view.key)}
                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${selectedView === view.key ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-blue-100 text-gray-700'}`}
                aria-current={selectedView === view.key ? 'page' : undefined}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="md:w-3/4">
          {selectedView && currentDefaultItem && currentViewDefinition && ( 
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">{currentViewDefinition.label}</h2>
                 {!(currentViewDefinition && currentViewDefinition.disableAdd) && (
                    <button 
                        onClick={handleAddItem}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Adicionar Novo
                    </button>
                 )}
              </div>
              {renderTable()}
            </>
          )}
          {!selectedView && (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Bem-vindo ao Painel Administrativo!</h2>
                <p className="text-gray-600">Selecione uma categoria ao lado para gerenciar os componentes do sistema.</p>
            </div>
          )}
        </main>
      </div>
      {isModalOpen && selectedView && currentDefaultItem && currentViewDefinition && (
        <FormModal 
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSave={handleSaveItem}
          itemToEdit={editingItem as any} 
          itemType={currentViewDefinition.key}
          defaultItem={currentDefaultItem as any} 
          isReadOnly={currentViewDefinition.key === 'archivedQuotes'}
        />
      )}
    </div>
  );
};

export default AdminPage;
