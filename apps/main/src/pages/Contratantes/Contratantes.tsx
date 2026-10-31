import { ContractorDirectoryScreen } from '@soul540/screens';
import { apiFetch } from '../../lib/api';

export default function Contratantes() {
  return <ContractorDirectoryScreen apiFetch={apiFetch} exportFileName="contratantes-sorocaba" />;
}
