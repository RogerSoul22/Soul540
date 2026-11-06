import { ChecklistDeliveryScreen } from '../../../../../packages/screens/src/index';
import { apiFetch } from '../../lib/api';

export default function ChecklistEnvio() {
  return <ChecklistDeliveryScreen apiFetch={apiFetch} storageScope="campinas" systemName="Campinas" />;
}
