import assert from 'node:assert/strict';
import test from 'node:test';
import { buildInfNFe } from './nfe-xml';

test('escapes user-provided text before generating NF-e XML', () => {
  const previousEnvironment = process.env.NFE_AMBIENTE;
  process.env.NFE_AMBIENTE = 'producao';
  const xml = buildInfNFe(
    {
      clientDocument: '12345678909',
      clientName: 'Cliente & Filho',
      clientAddress: 'Rua <Central>',
      clientNumber: '10',
      clientDistrict: 'Centro',
      clientCity: 'Sorocaba',
      clientState: 'SP',
      clientPostalCode: '18000000',
      clientEmail: 'cliente@example.com',
      notes: 'Observação <importante>',
      items: [{ description: 'Produto & Especial', ncm: '1234', cfop: '5102', quantity: 1, unitPrice: 10, unit: 'UN' }],
      subtotal: 10,
      totalValue: 10,
    },
    1,
    '35261012345678000199550010000000011123456789',
  );

  assert.match(xml, /Cliente &amp; Filho/);
  assert.match(xml, /Rua &lt;Central&gt;/);
  assert.match(xml, /Produto &amp; Especial/);
  assert.doesNotMatch(xml, /Cliente & Filho|Rua <Central>|Produto & Especial/);
  if (previousEnvironment === undefined) delete process.env.NFE_AMBIENTE;
  else process.env.NFE_AMBIENTE = previousEnvironment;
});
