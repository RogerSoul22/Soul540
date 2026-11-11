import { SupplyOrdersScreen } from '../../../../../packages/screens/src';
import { apiFetch } from '../../lib/api';

export default function PedidosInsumos() {
  return <SupplyOrdersScreen apiFetch={apiFetch} mode="franchise" />;
}
