import { ChecklistDeliveryScreen } from '@soul540/screens';
import { apiFetch } from '../../lib/api';

export default function ChecklistEnvio() {
  return <ChecklistDeliveryScreen apiFetch={apiFetch} storageScope="itu" systemName="Itu" />;
}
