
export enum RoofType {
  CERAMIC = 'Cerâmica',
  METAL = 'Metálico',
  SLAB = 'Laje',
  FIBER_CEMENT = 'Fibrocimento (Geral)',
  FIBER_CEMENT_WOOD = 'Fibrocimento (Estrutura Madeira)',
  FIBER_CEMENT_METAL = 'Fibrocimento (Estrutura Metálica)',
  OTHER = 'Outro',
}

export interface RegionalPrice {
  sudeste: number;
  sul?: number;
  centroOeste?: number;
  norte?: number;
  nordeste?: number;
}

export interface SolarPanel {
  id: string;
  sapCode?: string;
  name: string; 
  brand?: string; 
  modelName?: string; 
  powerWp: number;
  price: RegionalPrice; 
  cellType?: string; 
  areaM2?: number;
  numberOfCells?: number;
  efficiency?: number; 
  notes?: string; 
}

export interface Inverter {
  id: string;
  sapCode?: string;
  name: string; 
  brand?: string; 
  modelName?: string; 
  powerKw: number;
  price: RegionalPrice; 
  phase: 'monofasico' | 'trifasico' | 'bombeamento';
  type: 'string' | 'micro' | 'bombeamento';
  maxPanelsPerMicro: number; 
  voltage?: string; 
  mpptInputs?: number; 
  recommendedBreakerModel?: string; 
  stringBoxInfo?: string; 
  extendedWarrantyInfo?: string; 
  maxPanelPowerWpInput?: number; 
  notes?: string;
}

export interface MountingStructure {
  id: string;
  sapCode?: string;
  name: string;
  panelsPerUnit: number;
  material?: string; 
  compatibleRoofTypes: RoofType[];
  price: number; 
  brand?: string;
  roofRegion?: string; 
  profileType?: string; 
  windSpeedRatingMps?: number; 
  notes?: string;
}

export interface Cable {
  id: string;
  sapCode?: string;
  name: string;
  lengthMetersPerUnit: number;
  color?: 'vermelho' | 'preto' | 'conjunto' | 'ac_trunk' | 'geral_ca';
  price: number;
  isAcCable?: boolean;
  crossSectionalAreaMm2?: number; 
  notes?: string; 
}

export interface SurgeProtector {
  id: string;
  sapCode?: string;
  name: string;
  type: 'CA' | 'CC' | 'Híbrido';
  price: number;
  voltageRating?: string; 
  currentRatingKa?: string; 
  notes?: string;
}

export interface CircuitBreaker {
  id: string;
  sapCode?: string; 
  name: string;
  amps: number;
  poles: number;
  price: number;
  modelCode: string; // Made mandatory for rule-based selection
  notes?: string;
}

export interface ACConnector {
  id: string;
  sapCode?: string;
  name: string;
  price: number;
  compatibilityNote?: string; 
  notes?: string;
}

export interface InverterSupport {
  id: string;
  sapCode?: string; 
  name: string;
  price: number;
  notes?: string;
}

export type PaymentType = 'avista' | 'cartao';

export interface CreditCardTerm {
  id: string;
  code: string; // e.g., CC01
  description: string; // e.g., "30 dias", "30/60 dias"
  costPercentage: number; // e.g., 0.0291 for 2.91%
  numberOfInstallments: number; // e.g., 1, 2, 12
}


export interface QuoteFormData {
  name: string;
  email: string;
  phone?: string;
  installationCity: string; // Added
  roofType: RoofType;

  selectedPanelId?: string;
  numberOfPanels?: number;
  selectedMicroInverterId?: string;
  
  paymentType: PaymentType;
  selectedCreditCardTermId?: string; 
}

export interface ComponentCostDetail {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  sapCode?: string; 
  notes?: string;
}

export interface QuoteEstimate {
  quoteNumber?: string; // Adicionado para o número do orçamento
  systemSizeKWp?: number;
  installationCity?: string; 
  
  componentDetails?: ComponentCostDetail[];
  totalComponentCost?: number; 
  totalSystemCost?: number; 
  finalDiscountedPrice?: number; 
  
  targetInverterCapacityKw?: number; 
  actualInverterCapacityKw?: number; 
  inverterSizingRatio?: number;
  inverterSystemNote?: string;
  validationWarnings?: string[];

  paymentType?: PaymentType;
  selectedTermDescription?: string;
  financingRate?: number; 
  financingCostValue?: number; 
  totalPriceWithFinancing?: number; 
  installments?: number;
  installmentValue?: number;
  appliedDiscountDescription?: string; // Added to show which discount was applied
}

export type UserRole = 'customer' | 'integrator';

export interface Integrator {
  id: string;
  username: string;
  password?: string; // Stored as plain text for this simulation
  displayName?: string;
  /** This stores the final calculated discount multiplier (e.g., 0.510048 * 0.84) */
  integratorDiscountValue: number;
}

export interface ArchivedQuote {
  id: string; // Unique ID for the archived quote itself
  quoteNumber: string;
  timestamp: string; // ISO string date
  formData: QuoteFormData;
  estimate: QuoteEstimate;
  generatedByRole: UserRole;
  integratorId?: string;
  integratorDisplayName?: string;
}

export type AdminViewType = 
  | 'panels' 
  | 'inverters' 
  | 'structures' 
  | 'cables' 
  | 'protectors' 
  | 'breakers' 
  | 'acConnectors' 
  | 'inverterSupports' 
  | 'creditCardTerms' 
  | 'integrators'
  | 'archivedQuotes' // Nova visualização
  | null;

export type AppComponentTypes = 
  | SolarPanel 
  | Inverter 
  | MountingStructure 
  | Cable 
  | SurgeProtector 
  | CircuitBreaker 
  | ACConnector 
  | InverterSupport 
  | CreditCardTerm 
  | Integrator
  | ArchivedQuote; // Novo tipo de componente

export interface BreakerRule {
  microInverterModelName: string;
  microsInSeries: number;
  circuitBreakerModelCode: string;
}
