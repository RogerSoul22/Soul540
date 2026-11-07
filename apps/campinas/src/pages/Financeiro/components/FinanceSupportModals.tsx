import FinanceCategoryModal from './FinanceCategoryModal';
import FinanceXmlImportModal from './FinanceXmlImportModal';
import type { FinanceSupportController } from '../types/finance-support-types';

export default function FinanceSupportModals({ controller }: { controller: FinanceSupportController }) {
  return (
    <>
      <FinanceXmlImportModal controller={controller} />
      <FinanceCategoryModal controller={controller} />
    </>
  );
}
