import ChecklistEnvioPage from '@shared/ChecklistEnvioPage';
import { apiFetch } from '@/lib/api';

export default function ChecklistEnvio() {
  return (
    <ChecklistEnvioPage
      apiFetch={apiFetch}
      storageScope="fabrica"
      systemName="Fabrica"
    />
  );
}
