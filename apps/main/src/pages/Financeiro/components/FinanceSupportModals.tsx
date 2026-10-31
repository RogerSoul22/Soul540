import FinanceCategoryModal from './FinanceCategoryModal';
import FinanceInfoModal from './FinanceInfoModal';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';

export default function FinanceSupportModals({ controller }: { controller: FinanceiroController }) {
  return (
    <>
      <FinanceCategoryModal controller={controller} />
      <FinanceInfoModal controller={controller} />
    </>
  );
}
