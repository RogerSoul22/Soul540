import { UtensilsInventoryScreen } from '@soul540/screens';
import { apiFetch } from '../../lib/api';

export default function EstoqueUtensilios() {
  return <UtensilsInventoryScreen apiFetch={apiFetch} />;
}
