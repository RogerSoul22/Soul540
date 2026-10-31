import { EmployeeDirectoryScreen } from '../../../../../packages/screens/src/index';
import { apiFetch } from '../../lib/api';

export default function Funcionarios() {
  return <EmployeeDirectoryScreen apiFetch={apiFetch} />;
}
