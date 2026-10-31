import ChecklistEnvioPage from '../../../../../shared/checklists/ChecklistEnvioPage';
import { apiFetch } from '../../lib/api';

export default function ChecklistEnvio() {
  return <ChecklistEnvioPage apiFetch={apiFetch} storageScope="main" systemName="Consolidado" />;
}
