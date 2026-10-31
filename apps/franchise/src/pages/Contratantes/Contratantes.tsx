import { ContractorDirectoryScreen } from '../../../../../packages/screens/src/index';
import { apiFetch } from '../../lib/api';

export default function Contratantes() {
  return <ContractorDirectoryScreen apiFetch={apiFetch} exportFileName="contratantes-itu" />;
}
