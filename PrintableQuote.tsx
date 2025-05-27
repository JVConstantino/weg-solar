
import React from 'react';
import { QuoteEstimate, QuoteFormData } from '../types';
import { LOGO_ISRAEL_RAMOS_PATH, LOGO_WEG_PATH } from '../constants';

interface PrintableQuoteProps {
  estimate: QuoteEstimate;
  formData: QuoteFormData;
}

const PrintableQuote: React.FC<PrintableQuoteProps> = ({ estimate, formData }) => {
  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return 'N/A'; // Added NaN check
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const isCartao = estimate.paymentType === 'cartao';
  // Corrected placeholder checks:
  // Compare against the actual default paths from constants.ts
  const useIsraelRamosLogo = LOGO_ISRAEL_RAMOS_PATH && LOGO_ISRAEL_RAMOS_PATH !== '/public/images/irr-logo.jpg';
  const useWegLogo = LOGO_WEG_PATH && LOGO_WEG_PATH !== '/public/images/weg_sem_fundo.png';


  const styles: { [key: string]: React.CSSProperties } = {
    page: {
      fontFamily: 'Arial, sans-serif',
      fontSize: '8.5px', // Reduced base font for more compactness
      color: '#333',
      padding: '0',
      width: '100%',
      margin: '0 auto',
      backgroundColor: '#fff',
    },
    headerContainer: { // This is for the #pdf-header-content element captured by html2canvas
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '5mm 7mm 3mm 7mm', // Reduced padding
      borderBottom: '1.5px solid #004A98', 
      marginBottom: '3mm', // Reduced margin
      backgroundColor: '#ffffff', // Ensure background for capture
      width: 'calc(210mm - 14mm)', // Approximate A4 width minus margins for capture
      boxSizing: 'border-box',
    },
    logoWeg: {
      height: '15mm', // Slightly reduced
      maxWidth: '40mm',
      objectFit: 'contain',
    },
    logoIsraelRamos: {
      height: '13mm', // Slightly reduced
      maxWidth: '60mm',
      objectFit: 'contain',
    },
     mainContent: { 
        padding: '0 7mm 5mm 7mm', // Reduced bottom padding
    },
    mainTitle: {
      textAlign: 'center',
      fontSize: '15px', // Slightly reduced
      fontWeight: 'bold',
      color: '#004A98', // WEG Blue
      margin: '0 0 2mm 0', // Reduced margin
    },
    quoteNumberText: {
      textAlign: 'center',
      fontSize: '9px',
      color: '#555',
      margin: '0 0 4mm 0',
    },
    h2: {
      fontSize: '11px', // Reduced
      color: '#004A98',
      marginTop: '4mm', // Reduced
      marginBottom: '2mm', // Reduced
      borderBottom: '1px solid #B3D4FC',
      paddingBottom: '1mm', // Reduced
      fontWeight: 'bold',
    },
    section: {
      marginBottom: '3mm', // Reduced
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginBottom: '2mm', // Reduced
    },
    th: {
      border: '1px solid #BDBDBD',
      padding: '1.5mm', // Reduced
      textAlign: 'left',
      backgroundColor: '#004A98',
      color: '#FFFFFF',
      fontSize: '8px', // Reduced
      fontWeight: 'bold',
    },
    td: {
      border: '1px solid #E0E0E0',
      padding: '1.5mm', // Reduced
      fontSize: '8px', // Reduced
    },
    componentNameTd: {
        border: '1px solid #E0E0E0', 
        padding: '1.5mm',
        fontSize: '8.5px', // Slightly reduced
        fontWeight: '500',
    },
    rowEven: { backgroundColor: '#F7FAFC' },
    rowOdd: { backgroundColor: '#FFFFFF' },
    textRight: { textAlign: 'right' },
    textCenter: { textAlign: 'center' },
    bold: { fontWeight: 'bold' },
    
    financialSummaryBox: {
      backgroundColor: '#f3f0f9', 
      padding: '4mm', // Reduced
      borderRadius: '2.5mm',
      marginTop: '4mm',
      border: '1px solid #d1c4e9', 
    },
    financialSummaryTitle: {
      fontSize: '13px', // Reduced
      fontWeight: 'bold',
      color: '#4a0072', 
      textAlign: 'center',
      marginBottom: '3mm', // Reduced
    },
    totalOrcamentoLabel: {
      fontSize: '9px', // Reduced
      color: '#6a1b9a', 
      textAlign: 'center',
      marginBottom: '0.5mm',
    },
    totalOrcamentoValue: {
      fontSize: '16px', // Reduced
      fontWeight: 'bold',
      color: '#4a0072', 
      textAlign: 'center',
      marginBottom: '1mm',
    },
    totalOrcamentoSubtext: {
      fontSize: '7.5px', // Reduced
      color: '#7b1fa2', 
      textAlign: 'center',
      marginBottom: '2.5mm',
    },
    hr: {
      border: 0,
      height: '1px',
      backgroundColor: '#d1c4e9',
      margin: '2.5mm 0', // Reduced
    },
    paymentChoice: {
      fontSize: '9px', // Reduced
      color: '#6a1b9a',
      marginBottom: '2.5mm',
    },
    paymentChoiceStrong: {
        fontWeight: 'bold',
        color: '#4a0072',
    },
    financingDetailsBox: {
      backgroundColor: '#ffffff',
      padding: '3mm', // Reduced
      borderRadius: '1.5mm',
      border: '1px solid #e0e0e0', 
      marginTop: '1.5mm',
    },
    financingDetailsTitle: {
      fontSize: '10px', // Reduced
      fontWeight: 'bold',
      color: '#311b92', 
      marginBottom: '2mm',
    },
    financingItem: {
      fontSize: '8.5px', // Reduced
      color: '#4527a0', 
      marginBottom: '1mm',
    },
    financingItemStrong: {
      fontWeight: 'bold',
    },
    financingValueHighlight: { 
      fontSize: '13px', // Reduced
      fontWeight: 'bold',
      color: '#311b92', 
      marginLeft: '1mm',
    },
    financingValueSmallHighlight: { 
        fontWeight: 'bold',
        color: '#311b92', 
    },
    footer: {
      marginTop: '6mm', // Reduced
      paddingTop: '2mm',
      borderTop: '1px solid #BDBDBD',
      fontSize: '7px', // Reduced
      textAlign: 'center',
      color: '#757575',
    },
  };

  return (
    // This outer div's content is what html2canvas will try to capture.
    // The #pdf-header-content and #printable-quote-main-content are inside it.
    <div style={styles.page}> 
        <div id="pdf-header-content" style={styles.headerContainer}>
          {useWegLogo && <img src={LOGO_WEG_PATH} alt="WEG Logo" style={styles.logoWeg} />}
          <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {useIsraelRamosLogo && <img src={LOGO_ISRAEL_RAMOS_PATH} alt="Israel Ramos Representações" style={styles.logoIsraelRamos} />}
          </div>
          {(!useWegLogo && !useIsraelRamosLogo) && <h1 style={{ ...styles.mainTitle, fontSize: '12px', textAlign: 'center', width: '100%' }}>Simulador Fotovoltaico WEG</h1>}
        </div>

        <div id="printable-quote-main-content" style={styles.mainContent}>
          <h1 style={styles.mainTitle}>Simulador Fotovoltaico WEG</h1>
          {estimate.quoteNumber && (
            <p style={styles.quoteNumberText}>
                Orçamento Nº: <strong style={{color: '#333'}}>{estimate.quoteNumber}</strong>
            </p>
          )}
          <div style={styles.section}>
            <p style={{ fontSize: '7.5px', margin: '0 0 3mm 0', textAlign: 'right' }}>Data: {new Date().toLocaleDateString('pt-BR')}</p>
            <h2 style={styles.h2}>Informações do Cliente</h2>
            <p><strong>Nome:</strong> {formData.name}</p>
            <p><strong>Email:</strong> {formData.email}</p>
            {formData.phone && <p><strong>Telefone:</strong> {formData.phone}</p>}
            <p><strong>Cidade de Instalação:</strong> {formData.installationCity || 'N/A'}</p>
            <p><strong>Tipo de Telhado:</strong> {formData.roofType}</p>
          </div>

          {estimate.validationWarnings && estimate.validationWarnings.length > 0 && (
            <div style={{ ...styles.section, border: '1px solid #FFB74D', padding: '2mm', backgroundColor: '#FFF3E0', borderRadius: '1.5mm' }}>
              <h2 style={{ ...styles.h2, color: '#E65100', borderBottom: '1px solid #FFB74D', marginTop: '0', marginBottom: '1mm' }}>Avisos Importantes</h2>
              <ul style={{ paddingLeft: '2.5mm', margin: 0, fontSize: '8px', color: '#E65100' }}>
                {estimate.validationWarnings.map((warning, index) => (
                  <li key={index}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          <div style={styles.section}>
            <h2 style={styles.h2}>Resumo do Sistema Proposto</h2>
            {estimate.systemSizeKWp != null && <p><strong>Potência DC dos Painéis:</strong> {estimate.systemSizeKWp.toFixed(2)} kWp</p>}
            {estimate.actualInverterCapacityKw != null && <p><strong>Potência AC do(s) Inversor(es):</strong> {estimate.actualInverterCapacityKw.toFixed(2)} kW</p>}
            {estimate.inverterSystemNote && <p style={{ fontSize: '7.5px', color: '#555' }}><em>Nota Inversor: {estimate.inverterSystemNote}</em></p>}
          </div>

          {estimate.componentDetails && estimate.componentDetails.length > 0 && (
            <div style={styles.section}>
              <h2 style={styles.h2}>Detalhamento dos Componentes</h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: '38%' }}>Componente</th>
                    <th style={{ ...styles.th, width: '15%' }}>Código SAP</th>
                    <th style={{ ...styles.th, ...styles.textCenter, width: '8%' }}>Qtd.</th>
                    <th style={{ ...styles.th, ...styles.textRight, width: '19%' }}>Preço Unit.</th>
                    <th style={{ ...styles.th, ...styles.textRight, width: '20%' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {estimate.componentDetails.map((item, index) => (
                    <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.componentNameTd}>{item.name}{item.notes && <span style={{ display: 'block', fontSize: '7px', color: '#666' }}>{item.notes}</span>}</td>
                      <td style={{ ...styles.td, ...styles.textCenter, fontSize: '7.5px' }}>{item.sapCode || 'N/A'}</td>
                      <td style={{ ...styles.td, ...styles.textCenter }}>{item.quantity}</td>
                      <td style={{ ...styles.td, ...styles.textRight }}>{formatCurrency(item.unitPrice)}</td>
                      <td style={{ ...styles.td, ...styles.textRight, ...styles.bold }}>{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ ...styles.textRight, ...styles.bold, fontSize: '9px', marginTop: '1mm' }}>
                Subtotal Componentes: {formatCurrency(estimate.totalComponentCost)}
              </p>
            </div>
          )}
          
          <div style={styles.financialSummaryBox}>
            <h2 style={styles.financialSummaryTitle}>Resumo Financeiro</h2>
            <p style={styles.totalOrcamentoLabel}>Valor Total do Orçamento (À Vista):</p>
            <p style={styles.totalOrcamentoValue}>{formatCurrency(estimate.finalDiscountedPrice)}</p>
            <p style={styles.totalOrcamentoSubtext}>(Custo dos equipamentos com desconto aplicado)</p>
            
            <div style={styles.hr}></div>

            <p style={styles.paymentChoice}>Forma de Pagamento Escolhida: <span style={styles.paymentChoiceStrong}>{isCartao ? 'Cartão de Crédito' : 'À Vista'}</span></p>

            {isCartao && estimate.selectedTermDescription && (
              <div style={styles.financingDetailsBox}>
                <h3 style={styles.financingDetailsTitle}>Detalhes do Financiamento:</h3>
                <p style={styles.financingItem}><span style={styles.financingItemStrong}>Condição:</span> {estimate.selectedTermDescription}</p>
                <p style={styles.financingItem}><span style={styles.financingItemStrong}>Taxa Aplicada:</span> {( (estimate.financingRate ?? 0) * 100).toFixed(2)}%</p>
                <p style={styles.financingItem}><span style={styles.financingItemStrong}>Custo do Financiamento:</span> {formatCurrency(estimate.financingCostValue)}</p>
                <p style={styles.financingItem}><span style={styles.financingItemStrong}>Valor Total no Cartão:</span><span style={styles.financingValueHighlight}>{formatCurrency(estimate.totalPriceWithFinancing)}</span></p>
                <p style={styles.financingItem}><span style={styles.financingItemStrong}>Número de Parcelas:</span> <span style={styles.financingValueSmallHighlight}>{estimate.installments ?? 'N/A'}x</span></p>
                <p style={styles.financingItem}><span style={styles.financingItemStrong}>Valor da Parcela:</span><span style={styles.financingValueHighlight}>{formatCurrency(estimate.installmentValue)}</span></p>
              </div>
            )}
             {!isCartao && estimate.finalDiscountedPrice != null && (
                <p style={{textAlign: 'center', marginTop: '2.5mm'}}>
                    <span style={styles.financingValueHighlight}>{formatCurrency(estimate.finalDiscountedPrice)}</span>
                </p>
             )}
          </div>

          <div style={styles.footer}>
            <p><strong>Aviso Legal:</strong> Os valores apresentados são estimativas. Um orçamento preciso requer análise técnica detalhada. Preços e condições podem variar.</p>
            <p>Simulador Fotovoltaico WEG - Gerado em: {new Date().toLocaleString('pt-BR')}</p>
          </div>
        </div>
    </div>
  );
};

export default PrintableQuote;
