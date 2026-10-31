import { UtensilsInventoryScreen } from '../../../../../packages/screens/src/index';
import { apiFetch } from '../../lib/api';

export default function EstoqueUtensilios() {
  return <UtensilsInventoryScreen apiFetch={apiFetch} />;
}
