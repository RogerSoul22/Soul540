import 'dotenv/config';
import { emitirNFe } from './server/services/nfe-sefaz';
import { checkCertValidity } from './server/services/cert';

console.log('🔐 Verificando certificado...');
const certInfo = checkCertValidity();
console.log(`   Válido: ${certInfo.valid} | Expira: ${certInfo.expiresAt.toLocaleDateString('pt-BR')} (${certInfo.daysLeft} dias)`);

const testInvoice = {
  clientName: 'NF-E EMITIDA EM AMBIENTE DE HOMOLOGACAO - SEM VALOR FISCAL',
  clientDocument: '11144477735',
  clientEmail: 'teste@homologacao.com',
  clientAddress: 'Rua das Flores',
  clientNumber: '100',
  clientDistrict: 'Centro',
  clientCity: 'Sorocaba',
  clientState: 'SP',
  clientPostalCode: '18010000',
  items: [{ description: 'Consultoria teste', quantity: 1, unitPrice: 1.00, ncm: '49019900', cfop: '5102', unit: 'UN' }],
  subtotal: 1.00,
  totalValue: 1.00,
  notes: 'Homologacao',
};

console.log('\n📤 Enviando para SEFAZ homologação...');
try {
  const result = await emitirNFe(testInvoice, 1);
  console.log('\n✅ RESULTADO:');
  console.log('   Status:    ', result.status);
  console.log('   Motivo:    ', result.motivo);
  console.log('   Chave:     ', result.chaveAcesso);
  console.log('   Protocolo: ', result.protocolo);
  console.log('   Número NF: ', result.numeroNF);
} catch (err: any) {
  console.log('\n❌ ERRO:', err.message);
}
