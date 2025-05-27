
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client'; 
import Header from './components/Header';
import Footer from './components/Footer';
import QuoteForm from './components/QuoteForm';
import QuoteResult from './components/QuoteResult';
import AdminPage from './components/AdminPage';
import AdminLoginPage from './components/AdminLoginPage';
import IntegratorLoginPage from './components/IntegratorLoginPage'; // New component
import PrintableQuote from './components/PrintableQuote'; 
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import { 
    QuoteFormData, QuoteEstimate, RoofType, ComponentCostDetail, 
    SolarPanel, Inverter, MountingStructure, Cable, SurgeProtector, CircuitBreaker, 
    ACConnector, InverterSupport, AdminViewType, RegionalPrice, AppComponentTypes,
    CreditCardTerm, BreakerRule, Integrator, ArchivedQuote // Added Integrator & ArchivedQuote
} from './types';
import {
  HERO_TITLE, HERO_SUBTITLE,
  MAX_MICROINVERTER_SERIAL_ASSOCIATION, CABLE_METERS_PER_AC_CONNECTOR, FIXED_SURGE_PROTECTORS_COUNT_MONO,
  DEFAULT_SOLAR_PANEL_OPTIONS, DEFAULT_INVERTER_OPTIONS, DEFAULT_MOUNTING_STRUCTURE_OPTIONS,
  DEFAULT_CABLE_OPTIONS, DEFAULT_SURGE_PROTECTOR_OPTIONS, DEFAULT_CIRCUIT_BREAKER_OPTIONS,
  DEFAULT_AC_CONNECTOR_OPTIONS, DEFAULT_INVERTER_SUPPORT_OPTIONS, DEFAULT_CREDIT_CARD_TERMS,
  BREAKER_RULES, DISCOUNT_FACTOR_A, DISCOUNT_FACTOR_B, DEFAULT_INTEGRATORS, INTEGRATOR_SESSION_KEY,
  QUOTE_SEQUENCE_INFO_KEY, ARCHIVED_QUOTES_KEY, DEFAULT_ARCHIVED_QUOTES // New constants
} from './constants';

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin";
const ADMIN_SESSION_KEY = 'isAdminAuthenticatedSolarApp';

type AppScreen = 'role_selection' | 'customer_configurator' | 'integrator_login' | 'integrator_configurator' | 'admin_login' | 'admin_panel';

// Helper to generate a unique ID for general purposes (like new items in admin)
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 5);


const App: React.FC = () => {
  const [estimate, setEstimate] = useState<QuoteEstimate | null>(null);
  const [currentFormData, setCurrentFormData] = useState<QuoteFormData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [appScreen, setAppScreen] = useState<AppScreen>('role_selection');
  const [adminSelectedView, setAdminSelectedView] = useState<AdminViewType>('panels');

  // Admin Auth
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminLoginError, setAdminLoginError] = useState<string | null>(null);

  // Integrator Auth
  const [loggedInIntegrator, setLoggedInIntegrator] = useState<Integrator | null>(null);
  const [integratorLoginError, setIntegratorLoginError] = useState<string | null>(null);
  
  // Component Data States
  const [solarPanels, setSolarPanels] = useState<SolarPanel[]>(DEFAULT_SOLAR_PANEL_OPTIONS);
  const [inverters, setInverters] = useState<Inverter[]>(DEFAULT_INVERTER_OPTIONS);
  const [mountingStructures, setMountingStructures] = useState<MountingStructure[]>(DEFAULT_MOUNTING_STRUCTURE_OPTIONS);
  const [cables, setCables] = useState<Cable[]>(DEFAULT_CABLE_OPTIONS);
  const [surgeProtectors, setSurgeProtectors] = useState<SurgeProtector[]>(DEFAULT_SURGE_PROTECTOR_OPTIONS);
  const [circuitBreakers, setCircuitBreakers] = useState<CircuitBreaker[]>(DEFAULT_CIRCUIT_BREAKER_OPTIONS);
  const [acConnectors, setAcConnectors] = useState<ACConnector[]>(DEFAULT_AC_CONNECTOR_OPTIONS);
  const [inverterSupports, setInverterSupports] = useState<InverterSupport[]>(DEFAULT_INVERTER_SUPPORT_OPTIONS);
  const [creditCardTerms, setCreditCardTerms] = useState<CreditCardTerm[]>(DEFAULT_CREDIT_CARD_TERMS);
  const [integrators, setIntegrators] = useState<Integrator[]>(DEFAULT_INTEGRATORS);
  const [archivedQuotes, setArchivedQuotes] = useState<ArchivedQuote[]>(DEFAULT_ARCHIVED_QUOTES);


  const componentData = useMemo(() => ({
    solarPanels, inverters, mountingStructures, cables, surgeProtectors, circuitBreakers, acConnectors, inverterSupports, creditCardTerms, integrators, archivedQuotes
  }), [solarPanels, inverters, mountingStructures, cables, surgeProtectors, circuitBreakers, acConnectors, inverterSupports, creditCardTerms, integrators, archivedQuotes]);

  const componentSetters = useMemo(() => ({
    setSolarPanels, setInverters, setMountingStructures, setCables, setSurgeProtectors, setCircuitBreakers, setAcConnectors, setInverterSupports, setCreditCardTerms, setIntegrators, setArchivedQuotes
  }), []);


  // Load all data from localStorage
  useEffect(() => {
    const loadData = <T extends AppComponentTypes & { id: string }>(key: string, defaultData: T[], setter: React.Dispatch<React.SetStateAction<T[]>>) => {
      try {
        const storedData = localStorage.getItem(key);
        if (storedData) {
          const parsedData = JSON.parse(storedData) as T[];
          if (Array.isArray(parsedData)) {
            // Ensure items have IDs, critical for ArchivedQuote as well
            const allItemsHaveId = parsedData.every(item => item && typeof (item as any).id !== 'undefined');
            
            if (parsedData.length === 0 && defaultData.length > 0) { 
              setter(defaultData); localStorage.setItem(key, JSON.stringify(defaultData)); return;
            }
            // If parsedData has items, check if they all have 'id'
            if (parsedData.length > 0 && allItemsHaveId) {
              setter(parsedData); return;
            }
            // If parsedData is empty and defaultData is also empty
            if (parsedData.length === 0 && defaultData.length === 0) {
               setter(parsedData); return;
            }
            // If parsedData has items but some lack 'id', or other structural issues, reset to default
            if (parsedData.length > 0 && !allItemsHaveId) {
              console.warn(`Data for ${key} in localStorage is missing IDs or malformed. Resetting to default.`);
            }
          }
        }
        setter(defaultData);
        // Only set localStorage if it was not set or if current default is different from stored.
        // This check is a bit simplistic for complex objects but aims to avoid unnecessary writes.
        const currentStoredString = localStorage.getItem(key);
        if (!currentStoredString || JSON.stringify(JSON.parse(currentStoredString || '[]')) !== JSON.stringify(defaultData) ) { 
            localStorage.setItem(key, JSON.stringify(defaultData));
        }
      } catch (e) {
        console.error(`Failed to load or parse ${key} from localStorage, using defaults.`, e);
        setter(defaultData); localStorage.setItem(key, JSON.stringify(defaultData));
      }
    };
    loadData('solarPanels', DEFAULT_SOLAR_PANEL_OPTIONS, setSolarPanels);
    loadData('inverters', DEFAULT_INVERTER_OPTIONS, setInverters);
    loadData('mountingStructures', DEFAULT_MOUNTING_STRUCTURE_OPTIONS, setMountingStructures);
    loadData('cables', DEFAULT_CABLE_OPTIONS, setCables);
    loadData('surgeProtectors', DEFAULT_SURGE_PROTECTOR_OPTIONS, setSurgeProtectors);
    loadData('circuitBreakers', DEFAULT_CIRCUIT_BREAKER_OPTIONS, setCircuitBreakers);
    loadData('acConnectors', DEFAULT_AC_CONNECTOR_OPTIONS, setAcConnectors);
    loadData('inverterSupports', DEFAULT_INVERTER_SUPPORT_OPTIONS, setInverterSupports);
    loadData('creditCardTerms', DEFAULT_CREDIT_CARD_TERMS, setCreditCardTerms);
    loadData('integrators', DEFAULT_INTEGRATORS, setIntegrators);
    loadData(ARCHIVED_QUOTES_KEY, DEFAULT_ARCHIVED_QUOTES, setArchivedQuotes);
  }, []); 

  // Save data to localStorage effects
  useEffect(() => { localStorage.setItem('solarPanels', JSON.stringify(solarPanels)); }, [solarPanels]);
  useEffect(() => { localStorage.setItem('inverters', JSON.stringify(inverters)); }, [inverters]);
  useEffect(() => { localStorage.setItem('mountingStructures', JSON.stringify(mountingStructures)); }, [mountingStructures]);
  useEffect(() => { localStorage.setItem('cables', JSON.stringify(cables)); }, [cables]);
  useEffect(() => { localStorage.setItem('surgeProtectors', JSON.stringify(surgeProtectors)); }, [surgeProtectors]);
  useEffect(() => { localStorage.setItem('circuitBreakers', JSON.stringify(circuitBreakers)); }, [circuitBreakers]);
  useEffect(() => { localStorage.setItem('acConnectors', JSON.stringify(acConnectors)); }, [acConnectors]);
  useEffect(() => { localStorage.setItem('inverterSupports', JSON.stringify(inverterSupports)); }, [inverterSupports]);
  useEffect(() => { localStorage.setItem('creditCardTerms', JSON.stringify(creditCardTerms)); }, [creditCardTerms]);
  useEffect(() => { localStorage.setItem('integrators', JSON.stringify(integrators)); }, [integrators]);
  useEffect(() => { localStorage.setItem(ARCHIVED_QUOTES_KEY, JSON.stringify(archivedQuotes)); }, [archivedQuotes]);


  // Session handling and initial screen determination
   useEffect(() => {
    const adminAuth = sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
    setIsAdminAuthenticated(adminAuth);

    const integratorAuthData = sessionStorage.getItem(INTEGRATOR_SESSION_KEY);
    if (integratorAuthData) {
        try {
            const integrator: Integrator = JSON.parse(integratorAuthData);
            setLoggedInIntegrator(integrator);
             // If integrator is logged in, start them at configurator
            setAppScreen('integrator_configurator');
            return; // Prioritize integrator session for configurator access
        } catch (e) {
            console.error("Failed to parse integrator session data", e);
            sessionStorage.removeItem(INTEGRATOR_SESSION_KEY);
        }
    }

    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    if (hash.startsWith('#/admin') || params.get('view') === 'admin') {
      if (adminAuth) {
        setAppScreen('admin_panel');
        const hashParts = hash.split('section=');
        const sectionFromHash = hashParts.length > 1 ? hashParts[1].split('&')[0] : params.get('section');
        setAdminSelectedView((sectionFromHash as AdminViewType) || 'panels');
      } else {
        setAppScreen('admin_login');
      }
    } else if (!loggedInIntegrator) { // Only go to role selection if not already in integrator flow
        setAppScreen('role_selection');
    }
    // If loggedInIntegrator is set from session, appScreen is already 'integrator_configurator'

  }, []); // Run once on mount

  const generateQuoteNumber = (): string => {
    let year = new Date().getFullYear();
    let sequence = 1;

    const storedSequenceInfo = localStorage.getItem(QUOTE_SEQUENCE_INFO_KEY);
    if (storedSequenceInfo) {
        try {
            const parsedInfo = JSON.parse(storedSequenceInfo);
            if (parsedInfo.year === year) {
                sequence = parsedInfo.lastSequence + 1;
            } else {
                // Year changed, reset sequence
                year = new Date().getFullYear(); // Ensure current year
                sequence = 1;
            }
        } catch (e) {
            console.error("Failed to parse quote sequence info, resetting.", e);
            // Fallback to default if parsing fails
        }
    }
    localStorage.setItem(QUOTE_SEQUENCE_INFO_KEY, JSON.stringify({ year, lastSequence: sequence }));
    return `${year}-${sequence.toString().padStart(5, '0')}`;
  };


  const calculateEstimateInternal = (data: QuoteFormData, currentIntegrator: Integrator | null, quoteNum: string): QuoteEstimate => {
    const componentDetails: ComponentCostDetail[] = [];
    let totalComponentCost = 0;
    let systemSizeKWp = 0;
    let actualInverterCapacityKw = 0;
    let inverterSystemNote = '';
    const validationWarnings: string[] = [];
    
    const numPanels = data.numberOfPanels || 0;
    if (numPanels <= 0) throw new Error("Número de painéis deve ser maior que zero.");

    const panelInfo = solarPanels.find(p => p.id === data.selectedPanelId);
    if (!panelInfo) throw new Error("Detalhes do painel solar não encontrados.");
    const panelPrice = panelInfo.price.sudeste;
    if (panelPrice === undefined) throw new Error(`Preço para região Sudeste não definido para o painel ${panelInfo.name}`);
    
    const panelTotalCost = panelPrice * numPanels;
    componentDetails.push({ name: `Painel Solar: ${panelInfo.name || panelInfo.modelName}`, quantity: numPanels, unitPrice: panelPrice, totalPrice: panelTotalCost, sapCode: panelInfo.sapCode });
    totalComponentCost += panelTotalCost;
    systemSizeKWp = (panelInfo.powerWp * numPanels) / 1000;

    const microInverterInfo = inverters.find(i => i.id === data.selectedMicroInverterId && i.type === 'micro');
    if (!microInverterInfo) throw new Error("Microinversor selecionado não encontrado ou inválido.");
    
    if (microInverterInfo.modelName === 'SIW100G M010 W00' && panelInfo.powerWp > 630) {
      validationWarnings.push(`Atenção: O painel ${panelInfo.name} (${panelInfo.powerWp}Wp) excede a potência máxima de 630Wp recomendada para o microinversor ${microInverterInfo.modelName}. Considere um painel de menor potência ou outro microinversor.`);
    }

    const microInverterPrice = microInverterInfo.price.sudeste;
    if (microInverterPrice === undefined) throw new Error(`Preço para região Sudeste não definido para o microinversor ${microInverterInfo.name}`);

    const maxPanelsPerMicro = microInverterInfo.maxPanelsPerMicro > 0 ? microInverterInfo.maxPanelsPerMicro : 2;
    const numberOfMicroinverters = Math.ceil(numPanels / maxPanelsPerMicro);
    actualInverterCapacityKw = numberOfMicroinverters * microInverterInfo.powerKw;
    const microInverterTotalCost = microInverterPrice * numberOfMicroinverters;
    componentDetails.push({ name: `Microinversor: ${microInverterInfo.name || microInverterInfo.modelName}`, quantity: numberOfMicroinverters, unitPrice: microInverterPrice, totalPrice: microInverterTotalCost, sapCode: microInverterInfo.sapCode });
    totalComponentCost += microInverterTotalCost;
    inverterSystemNote = `${numberOfMicroinverters} microinversor(es) ${microInverterInfo.name || microInverterInfo.modelName} (${maxPanelsPerMicro} painel/micro). Potência AC total: ${actualInverterCapacityKw.toFixed(2)} kW.`;

    let defaultSurgeProtector = surgeProtectors.find(sp => sp.type === 'CA'); 
    if (!defaultSurgeProtector && surgeProtectors.length > 0) defaultSurgeProtector = surgeProtectors[0]; 
    if (defaultSurgeProtector) {
      const protectorTotalCost = defaultSurgeProtector.price * FIXED_SURGE_PROTECTORS_COUNT_MONO;
      componentDetails.push({ name: `Protetor Surto (DPS CA): ${defaultSurgeProtector.name}`, quantity: FIXED_SURGE_PROTECTORS_COUNT_MONO, unitPrice: defaultSurgeProtector.price, totalPrice: protectorTotalCost, sapCode: defaultSurgeProtector.sapCode });
      totalComponentCost += protectorTotalCost;
    } else {
      componentDetails.push({ name: 'Protetor Surto (DPS CA)', quantity: FIXED_SURGE_PROTECTORS_COUNT_MONO, unitPrice: 0, totalPrice: 0, sapCode: 'N/A', notes: "Pendente de cadastro no Admin" });
    }

    const numberOfCAConnectors = Math.ceil(numberOfMicroinverters / MAX_MICROINVERTER_SERIAL_ASSOCIATION);
    let defaultACConnector = acConnectors.find(ac => microInverterInfo.modelName && ac.compatibilityNote?.includes(microInverterInfo.modelName)) || (acConnectors.length > 0 ? acConnectors[0] : null);
    if (defaultACConnector) {
      const acConnectorTotalCost = defaultACConnector.price * numberOfCAConnectors;
      componentDetails.push({ name: `Conector AC Tronco: ${defaultACConnector.name}`, quantity: numberOfCAConnectors, unitPrice: defaultACConnector.price, totalPrice: acConnectorTotalCost, sapCode: defaultACConnector.sapCode });
      totalComponentCost += acConnectorTotalCost;
    } else {
      componentDetails.push({ name: 'Conector AC Tronco', quantity: numberOfCAConnectors, unitPrice: 0, totalPrice: 0, sapCode: 'N/A', notes: "Pendente de cadastro no Admin" });
    }

    const totalCableMeters = numberOfCAConnectors * CABLE_METERS_PER_AC_CONNECTOR;
    const defaultACCable = cables.find(c => c.isAcCable && c.notes?.toLowerCase().includes('microinversor')) || cables.find(c => c.isAcCable) || (cables.length > 0 ? cables[0] : null); 
    if (defaultACCable && defaultACCable.lengthMetersPerUnit > 0) {
      const numberOfCableUnits = Math.ceil(totalCableMeters / defaultACCable.lengthMetersPerUnit);
      const cableTotalCost = defaultACCable.price * numberOfCableUnits;
      componentDetails.push({ name: `Cabo AC Tronco: ${defaultACCable.name}`, quantity: numberOfCableUnits, unitPrice: defaultACCable.price, totalPrice: cableTotalCost, sapCode: defaultACCable.sapCode, notes: `${totalCableMeters.toFixed(0)}m total estimado (${numberOfCableUnits}x ${defaultACCable.lengthMetersPerUnit}m por unidade).`.trim() });
      totalComponentCost += cableTotalCost;
    } else {
       componentDetails.push({ name: 'Cabo AC Tronco', quantity: 0, unitPrice: 0, totalPrice: 0, sapCode: 'N/A', notes: `${totalCableMeters.toFixed(0)}m estimado. Detalhes pendentes de cadastro no Admin.` });
    }
    
    // --- Inverter Support Logic ---
    if (data.roofType !== RoofType.METAL) {
        const numberOfInverterSupports = numberOfMicroinverters;
        const specificInverterSupport = inverterSupports.find(is => is.sapCode === '17702839'); // Specific SAP code for HR/HSR
        const defaultInverterSupport = specificInverterSupport || (inverterSupports.length > 0 ? inverterSupports[0] : null);

        if (defaultInverterSupport) {
            const supportTotalCost = defaultInverterSupport.price * numberOfInverterSupports;
            componentDetails.push({ 
                name: `Suporte Microinversor: ${defaultInverterSupport.name}`, 
                quantity: numberOfInverterSupports, 
                unitPrice: defaultInverterSupport.price, 
                totalPrice: supportTotalCost, 
                sapCode: defaultInverterSupport.sapCode 
            });
            totalComponentCost += supportTotalCost;
            if (!specificInverterSupport && defaultInverterSupport && defaultInverterSupport.sapCode !== '17702839') {
                validationWarnings.push(`Atenção: Suporte de microinversor específico (SAP 17702839 - HR/HSR) não encontrado para telhado ${data.roofType}. Usando ${defaultInverterSupport.name} (SAP ${defaultInverterSupport.sapCode || 'N/A'}) como fallback.`);
            }
        } else {
            componentDetails.push({ 
                name: 'Suporte Microinversor', 
                quantity: numberOfInverterSupports, 
                unitPrice: 0, 
                totalPrice: 0, 
                sapCode: '17702839', 
                notes: `Suporte para telhado ${data.roofType} (Específico SAP 17702839 se aplicável) pendente de cadastro no Admin.` 
            });
        }
    }
    // --- End Inverter Support Logic ---

    let structureCost = 0;
    if (data.roofType === RoofType.METAL) {
        const struct10 = mountingStructures.find(s => s.compatibleRoofTypes.includes(RoofType.METAL) && s.panelsPerUnit === 10 && s.notes?.toLowerCase().includes('microinversor'));
        const struct2 = mountingStructures.find(s => s.compatibleRoofTypes.includes(RoofType.METAL) && s.panelsPerUnit === 2 && s.notes?.toLowerCase().includes('microinversor'));
        if (!struct10 || !struct2) {
            const note = `Estruturas p/ 10 e/ou 2 painéis (específicas p/ microinversor) não cadastradas para telhado metálico.`;
            componentDetails.push({ name: `Estrutura Metálica`, quantity: 0, unitPrice: 0, totalPrice: 0, sapCode: 'N/A', notes: note});
        } else {
            const numStruct10 = Math.floor(numPanels / 10);
            const remainingPanelsForStruct = numPanels % 10;
            const numStruct2 = Math.ceil(remainingPanelsForStruct / 2);
            structureCost = (numStruct10 * struct10.price) + (numStruct2 * struct2.price);
            if (numStruct10 > 0) componentDetails.push({ name: `Estrutura Metálica: ${struct10.name}`, quantity: numStruct10, unitPrice: struct10.price, totalPrice: numStruct10 * struct10.price, sapCode: struct10.sapCode });
            if (numStruct2 > 0) componentDetails.push({ name: `Estrutura Metálica: ${struct2.name}`, quantity: numStruct2, unitPrice: struct2.price, totalPrice: numStruct2 * struct2.price, sapCode: struct2.sapCode });
        }
    } else { 
        const struct4Panel = mountingStructures.find(s => s.compatibleRoofTypes.includes(data.roofType) && s.panelsPerUnit === 4) || mountingStructures.find(s => s.panelsPerUnit === 4); 
        if (struct4Panel) {
            const numStruct4 = Math.ceil(numPanels / 4);
            structureCost = struct4Panel.price * numStruct4;
            componentDetails.push({ name: `Estrutura (${data.roofType}): ${struct4Panel.name}`, quantity: numStruct4, unitPrice: struct4Panel.price, totalPrice: structureCost, sapCode: struct4Panel.sapCode });
        } else {
            componentDetails.push({ name: `Estrutura (${data.roofType})`, quantity: 0, unitPrice: 0, totalPrice: 0, sapCode: 'N/A', notes: "Pendente de cadastro no Admin."});
        }
    }
    totalComponentCost += structureCost;
    
    let breakersCost = 0;
    const numAcStrings = numberOfCAConnectors; 
    
    for (let i = 0; i < numAcStrings; i++) {
        let microsInThisString = MAX_MICROINVERTER_SERIAL_ASSOCIATION;
        if (i === numAcStrings - 1) { 
            const remainder = numberOfMicroinverters % MAX_MICROINVERTER_SERIAL_ASSOCIATION;
            if (remainder > 0) {
                microsInThisString = remainder;
            }
        }
        
        const rule = BREAKER_RULES.find(r => 
            r.microInverterModelName === microInverterInfo.modelName && 
            r.microsInSeries === microsInThisString
        );

        if (rule) {
            const breakerInfo = circuitBreakers.find(cb => cb.modelCode === rule.circuitBreakerModelCode);
            if (breakerInfo) {
                breakersCost += breakerInfo.price;
                const existingBreakerDetail = componentDetails.find(cd => cd.sapCode === breakerInfo.sapCode && cd.name.includes(breakerInfo.name));
                if (existingBreakerDetail) {
                    existingBreakerDetail.quantity += 1;
                    existingBreakerDetail.totalPrice += breakerInfo.price;
                } else {
                    componentDetails.push({ 
                        name: `Disjuntor: ${breakerInfo.name}`, 
                        quantity: 1, 
                        unitPrice: breakerInfo.price, 
                        totalPrice: breakerInfo.price,
                        sapCode: breakerInfo.sapCode,
                        notes: (breakerInfo.modelCode ? `Mod: ${breakerInfo.modelCode}` : `Para ${microsInThisString} micros ${microInverterInfo.modelName}`)
                    });
                }
            } else {
                 componentDetails.push({ name: `Disjuntor (${rule.circuitBreakerModelCode})`, quantity: 1, unitPrice: 0, totalPrice: 0, sapCode: 'N/A', notes: `Modelo ${rule.circuitBreakerModelCode} não cadastrado no Admin.` });
            }
        } else {
             componentDetails.push({ name: `Disjuntor`, quantity: 1, unitPrice: 0, totalPrice: 0, sapCode: 'N/A', notes: `Regra para ${microsInThisString} micros ${microInverterInfo.modelName} não encontrada.` });
        }
    }
    totalComponentCost += breakersCost;
    
    const totalSystemCost = totalComponentCost;
    
    let appliedDiscountDesc = '';
    const finalPriceMultiplier = currentIntegrator 
        ? currentIntegrator.integratorDiscountValue 
        : (DISCOUNT_FACTOR_A * DISCOUNT_FACTOR_B);

    if (currentIntegrator) {
        appliedDiscountDesc = `Desconto de Integrador (${currentIntegrator.displayName || currentIntegrator.username}) aplicado. Multiplicador final: ${currentIntegrator.integratorDiscountValue.toFixed(6)}`;
    } else {
        appliedDiscountDesc = `Desconto padrão de cliente aplicado. Multiplicadores: A=${DISCOUNT_FACTOR_A.toFixed(6)}, B=${DISCOUNT_FACTOR_B.toFixed(6)}. Final: ${finalPriceMultiplier.toFixed(6)}`;
    }
    
    const finalDiscountedPrice = totalSystemCost * finalPriceMultiplier;
    
    const estimateResult: QuoteEstimate = {
      quoteNumber: quoteNum, // Adicionado
      systemSizeKWp: parseFloat(systemSizeKWp.toFixed(2)),
      installationCity: data.installationCity, 
      actualInverterCapacityKw: parseFloat(actualInverterCapacityKw.toFixed(2)),
      componentDetails,
      totalComponentCost: Math.round(totalComponentCost),
      totalSystemCost: Math.round(totalComponentCost), 
      finalDiscountedPrice: Math.round(finalDiscountedPrice),
      inverterSystemNote,
      paymentType: data.paymentType,
      validationWarnings: validationWarnings.length > 0 ? validationWarnings : undefined,
      appliedDiscountDescription: appliedDiscountDesc,
    };

    if (data.paymentType === 'cartao' && data.selectedCreditCardTermId && estimateResult.finalDiscountedPrice != null) {
        const selectedTerm = creditCardTerms.find(term => term.id === data.selectedCreditCardTermId);
        if (selectedTerm && estimateResult.finalDiscountedPrice != null) { 
            estimateResult.selectedTermDescription = selectedTerm.description;
            estimateResult.financingRate = selectedTerm.costPercentage;
            estimateResult.financingCostValue = estimateResult.finalDiscountedPrice * selectedTerm.costPercentage;
            estimateResult.totalPriceWithFinancing = estimateResult.finalDiscountedPrice + estimateResult.financingCostValue;
            estimateResult.installments = selectedTerm.numberOfInstallments;
            estimateResult.installmentValue = estimateResult.totalPriceWithFinancing / selectedTerm.numberOfInstallments;
            
            estimateResult.financingCostValue = Math.round(estimateResult.financingCostValue);
            estimateResult.totalPriceWithFinancing = Math.round(estimateResult.totalPriceWithFinancing);
            estimateResult.installmentValue = parseFloat(estimateResult.installmentValue.toFixed(2));
        }
    }

    return estimateResult;
  };
  
  const calculateEstimate = useCallback((data: QuoteFormData, currentIntegrator: Integrator | null, quoteNum: string): Promise<QuoteEstimate> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => { 
        try {
          const result = calculateEstimateInternal(data, currentIntegrator, quoteNum);
          resolve(result);
        } catch (e: any) {
          console.error("Error in calculation promise:", e.message, e.stack); 
          reject(new Error(e.message || "Ocorreu um erro interno ao calcular o orçamento."));
        }
      }, 1200);
    });
  }, [solarPanels, inverters, mountingStructures, cables, surgeProtectors, circuitBreakers, acConnectors, inverterSupports, creditCardTerms]); 

  const generatePdf = useCallback(async (estimateData: QuoteEstimate | null, formData: QuoteFormData | null) => {
    if (!estimateData || !formData) return;

    const printableElement = document.createElement('div');
    printableElement.style.position = 'absolute'; printableElement.style.left = '-9999px'; 
    printableElement.style.width = '210mm'; printableElement.style.padding = '0';
    printableElement.style.margin = '0'; printableElement.style.boxSizing = 'border-box';
    document.body.appendChild(printableElement);

    const root = ReactDOM.createRoot(printableElement);
    root.render(<PrintableQuote estimate={estimateData} formData={formData} />);
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth(); const pdfHeight = pdf.internal.pageSize.getHeight();
        const pageMargin = 8; const contentWidth = pdfWidth - (pageMargin * 2);
        
        const headerElementToCapture = printableElement.querySelector('#pdf-header-content') as HTMLElement;
        let headerCanvas: HTMLCanvasElement | null = null; let headerImgData: string | null = null;
        let headerRenderHeightOnPdf = 0; 

        if (headerElementToCapture) {
          try {
            headerCanvas = await html2canvas(headerElementToCapture, { scale: 2, backgroundColor: '#ffffff', useCORS: true });
            headerImgData = headerCanvas.toDataURL('image/png', 0.95);
            const headerProps = pdf.getImageProperties(headerImgData);
            headerRenderHeightOnPdf = (headerProps.height * contentWidth) / headerProps.width;
            headerRenderHeightOnPdf = Math.min(headerRenderHeightOnPdf, 30); 
          } catch (headerCanvasError) { console.error("Error capturing PDF header:", headerCanvasError); }
        }
        
        const mainContentElement = printableElement.querySelector('#printable-quote-main-content') as HTMLElement || printableElement;
        const originalCanvas = await html2canvas(mainContentElement, {
            scale: 2, useCORS: true, logging: false, width: mainContentElement.scrollWidth, 
            height: mainContentElement.scrollHeight, windowWidth: mainContentElement.scrollWidth,
            windowHeight: mainContentElement.scrollHeight, backgroundColor: '#ffffff', scrollX: 0, 
            scrollY: -window.scrollY, 
        });
        
        const imgProps = { width: originalCanvas.width, height: originalCanvas.height };
        if (imgProps.width === 0 || imgProps.height === 0) {
            console.error("PDF generation error: Main content canvas has zero dimensions.");
            setError("Erro ao gerar o PDF: conteúdo principal não pôde ser renderizado."); return;
        }
        const totalImgHeightInMm = (imgProps.height * contentWidth) / imgProps.width;
        let currentYPositionInImagePx = 0; let pageCount = 0;
        const tempSegmentCanvas = document.createElement('canvas');
        const tempSegmentCtx = tempSegmentCanvas.getContext('2d');
        if (!tempSegmentCtx) { throw new Error("Failed to create 2D context for temporary segment canvas.");}

        while (currentYPositionInImagePx < imgProps.height) {
            pageCount++; if (pageCount > 1) { pdf.addPage(); }
            if (headerImgData && pageCount > 0) { pdf.addImage(headerImgData, 'PNG', pageMargin, pageMargin, contentWidth, headerRenderHeightOnPdf, '', 'FAST'); }
            const effectiveContentStartY = pageMargin + (headerImgData ? headerRenderHeightOnPdf + 2 : 0); 
            const availableContentHeightCurrentPage = pdfHeight - effectiveContentStartY - pageMargin;
            let theoreticalSegmentHeightPx = Infinity;
            if (totalImgHeightInMm > 0) { theoreticalSegmentHeightPx = (availableContentHeightCurrentPage / totalImgHeightInMm) * imgProps.height * (imgProps.width / contentWidth) ; }
            const segmentHeightToDrawPx = Math.min( theoreticalSegmentHeightPx, imgProps.height - currentYPositionInImagePx );
            if (segmentHeightToDrawPx <= 0) break; 
            tempSegmentCanvas.width = imgProps.width; tempSegmentCanvas.height = segmentHeightToDrawPx;
            tempSegmentCtx.clearRect(0, 0, tempSegmentCanvas.width, tempSegmentCanvas.height); 
            tempSegmentCtx.drawImage( originalCanvas, 0, currentYPositionInImagePx, imgProps.width, segmentHeightToDrawPx, 0, 0, imgProps.width, segmentHeightToDrawPx );
            const segmentImgData = tempSegmentCanvas.toDataURL('image/png', 0.95); 
            const segmentHeightToDrawMm = (segmentHeightToDrawPx * contentWidth) / imgProps.width;
            pdf.addImage( segmentImgData, 'PNG', pageMargin, effectiveContentStartY, contentWidth, segmentHeightToDrawMm, '', 'FAST' );
            currentYPositionInImagePx += segmentHeightToDrawPx;
            if(pageCount > 15) { console.warn("PDF generation stopped after 15 pages."); break; }
        }
        const quoteFileName = estimateData.quoteNumber 
          ? `orcamento_${estimateData.quoteNumber}_${formData.name.replace(/\s+/g, '_') || 'cliente'}.pdf`
          : `orcamento-solar-${formData.name.replace(/\s+/g, '_') || 'cliente'}.pdf`;
        pdf.save(quoteFileName);
    } catch(err: any) {
        console.error("Error generating PDF:", err.message, err.stack);
        setError(`Erro ao gerar o PDF: ${err.message || "Erro desconhecido"}. Tente novamente.`);
    } finally {
        root.unmount();
        if (printableElement && printableElement.parentNode) { printableElement.parentNode.removeChild(printableElement); }
    }
  }, []); 


  const handleFormSubmit = useCallback(async (data: QuoteFormData) => {
    setIsLoading(true); setError(null); setEstimate(null); setCurrentFormData(data); 
    try {
      const quoteNum = generateQuoteNumber();
      const newEstimate = await calculateEstimate(data, loggedInIntegrator, quoteNum); 
      setEstimate(newEstimate);

      const newArchivedQuote: ArchivedQuote = {
          id: generateId(), // Unique ID for the archive entry
          quoteNumber: newEstimate.quoteNumber || quoteNum, // Ensure it has a quote number
          timestamp: new Date().toISOString(),
          formData: data,
          estimate: newEstimate,
          generatedByRole: loggedInIntegrator ? 'integrator' : 'customer',
          integratorId: loggedInIntegrator ? loggedInIntegrator.id : undefined,
          integratorDisplayName: loggedInIntegrator ? (loggedInIntegrator.displayName || loggedInIntegrator.username) : undefined,
      };
      setArchivedQuotes(prev => [...prev, newArchivedQuote]);

      const resultSection = document.getElementById('quoteResultSection');
      if (resultSection) { resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); } 
      else { window.scrollTo({ top: document.body.scrollHeight / 2, behavior: 'smooth' }); }
    } catch (e: any) {
      console.error("Submission error:", e); setError(e.message || "Falha ao processar sua solicitação."); setEstimate(null);
    } finally {
      setIsLoading(false);
    }
  }, [calculateEstimate, loggedInIntegrator, setArchivedQuotes]);

  const handleReset = useCallback(() => {
    setEstimate(null); setCurrentFormData(null); setError(null);
    const formSection = document.getElementById('formSection');
    if (formSection) { formSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); } 
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, []);

  const handleNavigateToAdminSection = (section?: AdminViewType) => {
    const targetSection = section || adminSelectedView || 'panels';
    setAdminSelectedView(targetSection);
    setAppScreen('admin_panel'); 
    const newPath = `#/admin?section=${targetSection}`;
    if (window.location.hash !== newPath && window.location.pathname + window.location.search + window.location.hash !== newPath ) { 
         history.pushState({section: targetSection}, `Admin - ${targetSection}`, newPath);
    }
  };

   const handleAdminLogin = (user: string, pass: string) => {
    if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
      setIsAdminAuthenticated(true); sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setAdminLoginError(null); setAppScreen('admin_panel');
      if (!adminSelectedView) setAdminSelectedView('panels'); 
    } else {
      setAdminLoginError("Usuário ou senha inválidos."); setIsAdminAuthenticated(false);
      sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false); sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setAppScreen('role_selection'); setAdminLoginError(null);
    history.pushState({}, "Simulador", window.location.pathname + window.location.search); 
  };

  const handleIntegratorLogin = (username: string, pass: string) => {
    const integrator = integrators.find(int => int.username === username && int.password === pass);
    if (integrator) {
        setLoggedInIntegrator(integrator);
        sessionStorage.setItem(INTEGRATOR_SESSION_KEY, JSON.stringify(integrator));
        setIntegratorLoginError(null);
        setAppScreen('integrator_configurator'); // Or 'customer_configurator' if they share form
        setEstimate(null); // Clear previous estimate
        setCurrentFormData(null); // Clear previous form data
    } else {
        setIntegratorLoginError("Usuário ou senha de integrador inválidos.");
        setLoggedInIntegrator(null);
        sessionStorage.removeItem(INTEGRATOR_SESSION_KEY);
    }
  };

  const handleIntegratorLogout = () => {
    setLoggedInIntegrator(null);
    sessionStorage.removeItem(INTEGRATOR_SESSION_KEY);
    setIntegratorLoginError(null);
    setAppScreen('role_selection');
    setEstimate(null); // Clear estimate on logout
    setCurrentFormData(null); // Clear form data
  };

  const RoleSelectionScreen: React.FC = () => (
    <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl w-full max-w-lg">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-4">Bem-vindo!</h2>
            <p className="text-lg text-gray-600 mb-10">Selecione seu perfil para continuar:</p>
            <div className="space-y-5">
                <button
                    onClick={() => { setAppScreen('customer_configurator'); setEstimate(null); setCurrentFormData(null); }}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-xl"
                >
                    Sou Cliente
                </button>
                <button
                    onClick={() => setAppScreen('integrator_login')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-xl"
                >
                    Sou Integrador
                </button>
                 <button 
                    onClick={() => {
                        if (isAdminAuthenticated) setAppScreen('admin_panel');
                        else setAppScreen('admin_login');
                    }} 
                    className="mt-8 text-sm text-gray-600 hover:text-gray-800 underline focus:outline-none"
                    aria-label="Acessar Painel Administrativo"
                >
                    Acessar Painel Administrativo
                </button>
            </div>
        </div>
    </main>
  );

  const ConfiguratorView: React.FC<{ isIntegrator: boolean }> = ({ isIntegrator }) => (
     <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <section id="hero" className="text-center mb-10 sm:mb-16 pt-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 leading-tight">
            {HERO_TITLE}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {HERO_SUBTITLE}
            {isIntegrator && loggedInIntegrator && (
                <span className="block mt-2 text-sm text-blue-700 font-semibold">
                    Simulando como Integrador: {loggedInIntegrator.displayName || loggedInIntegrator.username} (Desconto especial aplicado)
                </span>
            )}
          </p>
        </section>

        <div id="formSection" className="max-w-3xl mx-auto bg-transparent p-0 rounded-xl mb-12">
           {error && !isLoading && ( 
            <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm animate-fadeIn" role="alert">
              <strong className="font-bold">Erro na Simulação:</strong>
              <span className="block sm:inline ml-1">{error}</span>
            </div>
          )}
          {(!estimate || error) ? ( 
            <QuoteForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              solarPanelOptions={solarPanels}
              microInverterOptions={inverters.filter(inv => inv.type === 'micro')} 
              creditCardTermOptions={creditCardTerms}
            />
          ) : null}
        </div>
        
        {estimate && !error && currentFormData && ( 
            <div id="quoteResultSection">
                 <QuoteResult 
                    estimate={estimate} 
                    formData={currentFormData} 
                    onReset={handleReset} 
                    onPrint={() => generatePdf(estimate, currentFormData)}
                 />
            </div>
        )}
        
        <section id="benefits" className="mt-16 py-12 bg-white rounded-xl shadow-xl">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-12">Por Que Investir em Energia Solar?</h2>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {/* Benefit items */}
              <div className="p-4 sm:p-6 hover:shadow-lg transition-shadow rounded-lg">
                <div className="flex items-center justify-center mb-4 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 sm:w-16 sm:h-16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m0 0v-.375c0-.621-.504-1.125-1.125-1.125h-1.5M13.5 18.75a60.096 60.096 0 0 0 3.75-.615m0 0a2.25 2.25 0 0 0-1.145-2.401l-2.527-1.605A2.25 2.25 0 0 1 11.25 13.5v-1.5a2.25 2.25 0 0 1 2.25-2.25Z" />
                    </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Economia Duradoura</h3>
                <p className="text-gray-600 text-sm sm:text-base">Reduza significativamente seus gastos com energia elétrica por décadas.</p>
              </div>
              <div className="p-4 sm:p-6 hover:shadow-lg transition-shadow rounded-lg">
                <div className="flex items-center justify-center mb-4 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 sm:w-16 sm:h-16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                    </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Planeta Sustentável</h3>
                <p className="text-gray-600 text-sm sm:text-base">Invista em uma fonte de energia limpa, renovável e amiga do meio ambiente.</p>
              </div>
              <div className="p-4 sm:p-6 hover:shadow-lg transition-shadow rounded-lg">
                 <div className="flex items-center justify-center mb-4 text-yellow-500">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 sm:w-16 sm:h-16">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.307a11.95 11.95 0 0 1 5.814-5.519l2.74-1.22m0 0-5.94-2.28m5.94 2.28-2.28 5.941" />
                    </svg>
                 </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">Valorização Imediata</h3>
                <p className="text-gray-600 text-sm sm:text-base">Sistemas solares podem aumentar o valor de mercado do seu imóvel.</p>
              </div>
            </div>
            {!isIntegrator && (
             <div className="text-center mt-12">
                <button 
                    onClick={() => setAppScreen('role_selection')} 
                    className="text-sm text-blue-600 hover:text-blue-800 underline focus:outline-none"
                    aria-label="Voltar à seleção de perfil"
                >
                    Voltar à seleção de perfil
                </button>
            </div>)}
          </div>
        </section>
      </main>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-emerald-50">
      <Header loggedInIntegrator={loggedInIntegrator} onIntegratorLogout={handleIntegratorLogout} appScreen={appScreen} />
      
      {appScreen === 'role_selection' && <RoleSelectionScreen />}
      {appScreen === 'customer_configurator' && <ConfiguratorView isIntegrator={false} />}
      {appScreen === 'integrator_configurator' && <ConfiguratorView isIntegrator={true} />}
      
      {appScreen === 'integrator_login' && (
        <IntegratorLoginPage 
            onIntegratorLogin={handleIntegratorLogin} 
            loginError={integratorLoginError} 
            onGoBack={() => setAppScreen('role_selection')}
        />
      )}
      
      {appScreen === 'admin_login' && (
        <AdminLoginPage onLogin={handleAdminLogin} loginError={adminLoginError} />
      )}
      {appScreen === 'admin_panel' && isAdminAuthenticated && (
         <AdminPage
            componentData={componentData}
            componentSetters={componentSetters}
            selectedView={adminSelectedView}
            setSelectedView={handleNavigateToAdminSection} 
            onExitAdmin={handleAdminLogout}
        />
      )}
      {appScreen === 'admin_panel' && !isAdminAuthenticated && ( // Fallback if somehow admin_panel is set but not auth
        <AdminLoginPage onLogin={handleAdminLogin} loginError="Sessão expirada. Faça login novamente." />
      )}

      <Footer />
    </div>
  );
};

export default App;
