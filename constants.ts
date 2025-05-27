
import { RoofType, SolarPanel, Inverter, MountingStructure, Cable, SurgeProtector, CircuitBreaker, ACConnector, InverterSupport, RegionalPrice, CreditCardTerm, BreakerRule, Integrator, ArchivedQuote } from './types';

export const APP_TITLE = "Simulador Fotovoltaico WEG";
export const HERO_TITLE = "Simulador Fotovoltaico WEG";
export const HERO_SUBTITLE = "Selecione os painéis e o tipo de telhado. Calcularemos os componentes ideais para seu sistema fotovoltaico.";

// --- CAMINHOS DAS LOGOS ---
// INSTRUÇÃO: Coloque o arquivo 'irr-logo.jpg' na pasta raiz do seu projeto.
export const LOGO_ISRAEL_RAMOS_PATH = '/public/images/irr-logo.jpg'; 
// INSTRUÇÃO: Coloque o arquivo 'WEG SEM FUNDO.png' na pasta raiz do seu projeto.
export const LOGO_WEG_PATH = '/public/images/weg_sem_fundo.png';

// Placeholder antigo, pode ser removido ou mantido se usado em outro lugar, mas não no header.
export const LOGO_SOLAR_TEXT_BASE64 = 'YOUR_BASE64_STRING_HERE_SOLAR'; 


export const ROOF_TYPE_OPTIONS: { value: RoofType; label: string }[] = [
  { value: RoofType.CERAMIC, label: 'Telha Cerâmica' },
  { value: RoofType.METAL, label: 'Telhado Metálico' },
  { value: RoofType.SLAB, label: 'Laje de Concreto' },
  { value: RoofType.FIBER_CEMENT, label: 'Fibrocimento (Geral)' },
  { value: RoofType.FIBER_CEMENT_WOOD, label: 'Fibrocimento (Estrutura Madeira)' },
  { value: RoofType.FIBER_CEMENT_METAL, label: 'Fibrocimento (Estrutura Metálica)' },
  { value: RoofType.OTHER, label: 'Outro / Não Sei' },
];

// --- COMPONENT DATA (DEFAULTS, to be overridden by localStorage if admin makes changes) ---

const defaultRegionalPriceSE = (sudestePrice: number): RegionalPrice => ({
  sudeste: sudestePrice,
  sul: undefined, 
  centroOeste: undefined,
  norte: undefined,
  nordeste: undefined,
});

export const DEFAULT_SOLAR_PANEL_OPTIONS: SolarPanel[] = [
  { 
    id: 'panel-byd-535', sapCode: '18581410', name: 'Painel BYD 535Wp p-TYPE', brand: 'BYD', modelName: 'MLK-36', 
    powerWp: 535, price: defaultRegionalPriceSE(1582.28), cellType: 'p-TYPE', areaM2: 2.58, numberOfCells: 144, 
    notes: '[FINAME]' 
  },
  { 
    id: 'panel-tongwei-610', sapCode: '18253725', name: 'Painel TONGWEI 610Wp n-TYPE BIFACIAL', brand: 'TONGWEI', modelName: 'TWMNH-66HD', 
    powerWp: 610, price: defaultRegionalPriceSE(1319.58), cellType: 'n-TYPE', areaM2: 2.70, numberOfCells: 132, 
    notes: 'BIFACIAL' 
  },
  { 
    id: 'panel-ja-630', sapCode: '18096678', name: 'Painel JA Solar 630Wp n-TYPE BIFACIAL', brand: 'JA Solar', modelName: 'JAM72D42/LB', 
    powerWp: 630, price: defaultRegionalPriceSE(1362.85), cellType: 'n-TYPE', areaM2: 2.80, numberOfCells: 144, 
    notes: 'BIFACIAL'
  },
  { 
    id: 'panel-huasun-700', sapCode: '18376899', name: 'Painel HUASUN 700Wp HJT BIFACIAL', brand: 'HUASUN', modelName: 'HS-210-B132DS', 
    powerWp: 700, price: defaultRegionalPriceSE(1442.17), cellType: 'HJT', areaM2: 3.11, numberOfCells: 132, 
    notes: 'BIFACIAL'
  },
  {
    id: 'panel-trina-710', sapCode: '18120567', name: 'Painel TRINA 710Wp n-TYPE BIFACIAL', brand: 'TRINA', modelName: 'TSM-NEG21C.20',
    powerWp: 710, price: defaultRegionalPriceSE(1609.05), cellType: 'n-TYPE', areaM2: 3.11, numberOfCells: 132,
    notes: 'BIFACIAL'
  }
];

export const DEFAULT_INVERTER_OPTIONS: Inverter[] = [
  { 
    id: 'inv-weg-siw100g-m010', sapCode: '17490887', name: 'Microinversor WEG SIW100G M010 W00', brand: 'WEG', modelName: 'SIW100G M010 W00',
    powerKw: 1.0, price: defaultRegionalPriceSE(1554.40), phase: 'monofasico', type: 'micro', maxPanelsPerMicro: 2,
    voltage: '220 V', recommendedBreakerModel: 'MDWP-C16-2', mpptInputs: 2, maxPanelPowerWpInput: 670 
  },
  { 
    id: 'inv-weg-siw100g-m024', sapCode: '18308022', name: 'Microinversor WEG SIW100G M024 W10', brand: 'WEG', modelName: 'SIW100G M024 W10',
    powerKw: 2.4, price: defaultRegionalPriceSE(4193.00), phase: 'monofasico', type: 'micro', maxPanelsPerMicro: 4,
    voltage: '220 V', recommendedBreakerModel: 'MDWP-C20-2', mpptInputs: 4, maxPanelPowerWpInput: 710
  },
  {
    id: 'inv-weg-siw300h-m030', sapCode: '18127283', name: 'Inversor WEG SIW300H M030 W00', brand: 'WEG', modelName: 'SIW300H M030 W00',
    powerKw: 3, price: defaultRegionalPriceSE(4498.37), phase: 'monofasico', type: 'string', maxPanelsPerMicro: 0,
    voltage: '220 V', recommendedBreakerModel: 'MDWP-C25-2', mpptInputs: 2, stringBoxInfo: 'SB-2E/4E-2S-600DC'
  },
   {
    id: 'inv-weg-siw500h-st012', sapCode: '15680075', name: 'Inversor WEG SIW500H ST012 M2', brand: 'WEG', modelName: 'SIW500H ST012 M2',
    powerKw: 12, price: defaultRegionalPriceSE(14256.53), phase: 'trifasico', type: 'string', maxPanelsPerMicro: 0,
    voltage: '380 V', recommendedBreakerModel: 'MDWP-C32-3', mpptInputs: 4, stringBoxInfo: 'SB-2E/4E-2S-2X20A-1010V', extendedWarrantyInfo: '+ 5 anos SIW500H ST012 M2'
  }
];

export const DEFAULT_MOUNTING_STRUCTURE_OPTIONS: MountingStructure[] = [
  { 
    id: 'struct-weg-ceramic-4m-30', sapCode: '17930198', name: 'Estrutura Cerâmica WEG 4 Mód. (30-C-HR-HI-A-3-2080-M)', 
    panelsPerUnit: 4, compatibleRoofTypes: [RoofType.CERAMIC], price: 983.36, brand: 'WEG', 
    roofRegion: 'HI', profileType: 'HR', windSpeedRatingMps: 30 
  },
  { 
    id: 'struct-weg-metal-3m-55cm', sapCode: '14594568', name: 'Estrutura Metálica WEG 3 Mód. Retrato (Perfil 55cm)', 
    panelsPerUnit: 3, compatibleRoofTypes: [RoofType.METAL], price: 346.43, brand: 'WEG', profileType: '55cm' 
  },
  { 
    id: 'struct-weg-metal-micro-2m', sapCode: '17721638', name: 'Estrutura Metálica WEG p/ 2 Mód. (Microinversor)', 
    panelsPerUnit: 2, compatibleRoofTypes: [RoofType.METAL], price: 621.31, brand: 'WEG', notes: 'Para Microinversor'
  },
   { 
    id: 'struct-weg-metal-micro-10m', sapCode: '17722474', name: 'Estrutura Metálica WEG p/ 10 Mód. (Microinversor)', 
    panelsPerUnit: 10, compatibleRoofTypes: [RoofType.METAL], price: 2371.33, brand: 'WEG', notes: 'Para Microinversor'
  },
  {
    id: 'struct-solargroup-laje-4m', sapCode: '14594638', name: 'Estrutura Laje SOLARGROUP 4 Mód. Retrato',
    panelsPerUnit: 4, compatibleRoofTypes: [RoofType.SLAB], price: 1464.88, brand: 'SOLARGROUP'
  }
];

export const DEFAULT_CABLE_OPTIONS: Cable[] = [
  { 
    id: 'cable-cc-6mm-preto', sapCode: '13677909', name: 'Cabo CC Unipolar flexível NH 6mm² Preto', 
    lengthMetersPerUnit: 1, price: 11.45, color: 'preto', isAcCable: false, crossSectionalAreaMm2: 6, 
    notes: 'String e bombeamento. Preço por metro.'
  },
  { 
    id: 'cable-cc-6mm-vermelho', sapCode: '13677908', name: 'Cabo CC Unipolar flexível NH 6mm² Vermelho', 
    lengthMetersPerUnit: 1, price: 11.45, color: 'vermelho', isAcCable: false, crossSectionalAreaMm2: 6, 
    notes: 'String e bombeamento. Preço por metro.'
  },
  {
    id: 'cable-ac-3x6mm-weg', sapCode: '18512552', name: 'Cabo CA MP Flex HEPR/NH 3x6mm² 90°C PT 1kV',
    lengthMetersPerUnit: 1, price: 34.54, color: 'ac_trunk', isAcCable: true, crossSectionalAreaMm2: 6,
    notes: 'Microinversor SIW100G M024 W10. Preço por metro.'
  }
];

export const DEFAULT_SURGE_PROTECTOR_OPTIONS: SurgeProtector[] = [
  { 
    id: 'dps-weg-spw02-275-20', sapCode: '14827873', name: 'DPS WEG SPW02-275-20', 
    type: 'CA', price: 95.27, voltageRating: '275V', currentRatingKa: '20kA'
  },
];

export const DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreaker[] = [
  { 
    id: 'cb-mdwp-c10-2', sapCode: '15265721', name: 'Disjuntor WEG MDWP-C10-2', modelCode: 'MDWP-C10-2', amps: 10, poles: 2, price: 41.43,
  },
  { 
    id: 'cb-mdwp-c16-2', sapCode: '15265722', name: 'Disjuntor WEG MDWP-C16-2', modelCode: 'MDWP-C16-2', amps: 16, poles: 2, price: 44.52,
  },
  { 
    id: 'cb-mdwp-c20-2', sapCode: '15265723', name: 'Disjuntor WEG MDWP-C20-2', modelCode: 'MDWP-C20-2', amps: 20, poles: 2, price: 48.53,
  },
  { 
    id: 'cb-mdwp-c32-2', sapCode: '15265726', name: 'Disjuntor WEG MDWP-C32-2', modelCode: 'MDWP-C32-2', amps: 32, poles: 2, price: 62.91,
  },
  { 
    id: 'cb-mdwp-c40-2', sapCode: '15265727', name: 'Disjuntor WEG MDWP-C40-2', modelCode: 'MDWP-C40-2', amps: 40, poles: 2, price: 73.05,
  },
];

export const DEFAULT_AC_CONNECTOR_OPTIONS: ACConnector[] = [
    {
      id: 'ac-conn-weg-m010', sapCode: '17643632', name: 'Conector AC Kit SIW100G W00', 
      price: 87.93, compatibilityNote: 'SIW100G M010 W00'
    },
    {
      id: 'ac-conn-weg-m024', sapCode: '18460783', name: 'Conector AC Kit SIW100G W10', 
      price: 373.02, compatibilityNote: 'SIW100G M024 W10'
    },
];

export const DEFAULT_INVERTER_SUPPORT_OPTIONS: InverterSupport[] = [
    {id: 'inv-support-weg-hr-hsr', sapCode: '17702839', name: 'Suporte Microinversor WEG Kit Sup Fix HR/HSR SIW100G', price: 61.36, notes: 'Para telhados com perfil HR/HSR'},
    {id: 'inv-support-weg-plpa', sapCode: '17673518', name: 'Suporte Microinversor WEG Kit Sup Fix PLPA SIW100G', price: 47.28, notes: 'Para perfil plano elevado (PLPA)'},
];


// --- CALCULATION FACTORS ---
export const MAX_MICROINVERTER_SERIAL_ASSOCIATION = 5; 
export const CABLE_METERS_PER_AC_CONNECTOR = 10; 
export const FIXED_SURGE_PROTECTORS_COUNT_MONO = 2; 

export const DISCOUNT_FACTOR_A = 0.510048; // Global primary factor
export const DISCOUNT_FACTOR_B = 0.83; // Default customer specific secondary factor


export const BREAKER_RULES: BreakerRule[] = [
  // SIW100G M010 W00
  { microInverterModelName: 'SIW100G M010 W00', microsInSeries: 1, circuitBreakerModelCode: 'MDWP-C10-2' },
  { microInverterModelName: 'SIW100G M010 W00', microsInSeries: 2, circuitBreakerModelCode: 'MDWP-C16-2' },
  { microInverterModelName: 'SIW100G M010 W00', microsInSeries: 3, circuitBreakerModelCode: 'MDWP-C20-2' },
  { microInverterModelName: 'SIW100G M010 W00', microsInSeries: 4, circuitBreakerModelCode: 'MDWP-C32-2' },
  { microInverterModelName: 'SIW100G M010 W00', microsInSeries: 5, circuitBreakerModelCode: 'MDWP-C40-2' },
  // SIW100G M024 W10
  { microInverterModelName: 'SIW100G M024 W10', microsInSeries: 1, circuitBreakerModelCode: 'MDWP-C20-2' },
  { microInverterModelName: 'SIW100G M024 W10', microsInSeries: 2, circuitBreakerModelCode: 'MDWP-C40-2' },
];

const parseInstallments = (prazo: string): number => {
  if (!prazo || typeof prazo !== 'string') return 1;
  return (prazo.match(/\//g) || []).length + 1;
};

export const DEFAULT_CREDIT_CARD_TERMS: CreditCardTerm[] = [
  { id: 'cc-01', code: 'CC01', description: '30 dias', costPercentage: 0.0291, numberOfInstallments: parseInstallments('30 dias') },
  { id: 'cc-02', code: 'CC02', description: '30/60 dias', costPercentage: 0.0399, numberOfInstallments: parseInstallments('30/60 dias') },
  { id: 'cc-03', code: 'CC03', description: '30/60/90 dias', costPercentage: 0.0451, numberOfInstallments: parseInstallments('30/60/90 dias') },
  { id: 'cc-04', code: 'CC04', description: '30/60/90/120 dias', costPercentage: 0.0503, numberOfInstallments: parseInstallments('30/60/90/120 dias') },
  { id: 'cc-05', code: 'CC05', description: '30/60/90/120/150 dias', costPercentage: 0.0556, numberOfInstallments: parseInstallments('30/60/90/120/150 dias') },
  { id: 'cc-06', code: 'CC06', description: '30/60/90/120/150/180 dias', costPercentage: 0.0609, numberOfInstallments: parseInstallments('30/60/90/120/150/180 dias') },
  { id: 'cc-18', code: 'CC18', description: '30/60/90/120/150/180/210 dias', costPercentage: 0.0881, numberOfInstallments: parseInstallments('30/60/90/120/150/180/210 dias') },
  { id: 'cc-19', code: 'CC19', description: '30/60/90/120/150/180/210/240 dias', costPercentage: 0.0971, numberOfInstallments: parseInstallments('30/60/90/120/150/180/210/240 dias') },
  { id: 'cc-20', code: 'CC20', description: '30/60/90/120/150/180/210/240/270 dias', costPercentage: 0.1043, numberOfInstallments: parseInstallments('30/60/90/120/150/180/210/240/270 dias') },
  { id: 'cc-21', code: 'CC21', description: '30/60/90/120/150/180/210/240/270/300 dias', costPercentage: 0.1132, numberOfInstallments: parseInstallments('30/60/90/120/150/180/210/240/270/300 dias') },
  { id: 'cc-22', code: 'CC22', description: '30/60/90/120/150/180/210/240/270/300/330 dias', costPercentage: 0.1213, numberOfInstallments: parseInstallments('30/60/90/120/150/180/210/240/270/300/330 dias') },
  { id: 'cc-23', code: 'CC23', description: '30/60/90/120/150/180/210/240/270/300/330/360 dias', costPercentage: 0.1295, numberOfInstallments: parseInstallments('30/60/90/120/150/180/210/240/270/300/330/360 dias') },
];

// --- INTEGRATOR SPECIFIC ---
export const INTEGRATOR_SESSION_KEY = 'loggedInIntegratorSolarApp';

/**
 * Defines the secondary discount factors for integrators.
 * The final discount multiplier for an integrator will be DISCOUNT_FACTOR_A * one of these secondary factors.
 */
export const INTEGRATOR_SECONDARY_DISCOUNT_FACTORS_MAP: { [key: string]: number } = {
  'Nível Padrão (Fator Secundário x0.84)': 0.84,
  'Nível Desconto 1 (Fator Secundário x0.83)': 0.83,
  'Nível Desconto 2 (Fator Secundário x0.82)': 0.82,
  'Nível Desconto 3 (Fator Secundário x0.81)': 0.81,
  'Nível Desconto 4 (Fator Secundário x0.80)': 0.80,
};

export const DEFAULT_INTEGRATORS: Integrator[] = []; // No default integrators, admin must create them

// --- QUOTE ARCHIVING AND SEQUENCING ---
export const QUOTE_SEQUENCE_INFO_KEY = 'solarAppQuoteSequenceInfo'; // Stores { year: number, lastSequence: number }
export const ARCHIVED_QUOTES_KEY = 'solarAppArchivedQuotes';
export const DEFAULT_ARCHIVED_QUOTES: ArchivedQuote[] = [];
