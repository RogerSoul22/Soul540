import FinanceDeleteModal from './FinanceDeleteModal';
import FinanceEntryDetailsModal from './FinanceEntryDetailsModal';
import FinanceEventDetailsModal from './FinanceEventDetailsModal';
import type { FinanceiroController } from '../hooks/use-financeiro-controller';

export default function FinanceDetailsModals({ controller }: { controller: FinanceiroController }) {
  return (
    <>
      <FinanceEventDetailsModal controller={controller} />
      <FinanceEntryDetailsModal controller={controller} />
      <FinanceDeleteModal controller={controller} />
    </>
  );
}
