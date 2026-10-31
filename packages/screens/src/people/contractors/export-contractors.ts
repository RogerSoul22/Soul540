import { displayCategory } from './contractor-formatters';
import { contractorStatusConfig, type Contractor } from './contractor-types';

export default function exportContractors(contractors: Contractor[], fileName: string) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const header = ['Nome', 'Tipo', 'Telefone', 'Email', 'Cidade', 'Categoria', 'Status', 'Receita Total (R$)'];
  const rows = contractors.map((contractor) => [
    contractor.name,
    contractor.type === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica',
    contractor.phone,
    contractor.email,
    contractor.city ?? '',
    displayCategory(contractor.category ?? ''),
    contractorStatusConfig[contractor.status].label,
    (contractor.totalRevenue ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
  ]);
  const blob = new Blob([`\uFEFF${[header, ...rows].map((row) => row.map(escape).join(';')).join('\n')}`], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
