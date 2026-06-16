import ChecklistEnvioPage from '@shared/ChecklistEnvioPage';
import { apiFetch } from '@frontend/lib/api';

export default function ChecklistEnvio() {
  return (
    <ChecklistEnvioPage
      apiFetch={apiFetch}
      storageScope="main"
      systemName="Consolidado"
    />
  );
}
