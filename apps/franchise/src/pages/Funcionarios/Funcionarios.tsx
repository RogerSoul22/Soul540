import { EmployeeDirectoryScreen } from '@soul540/screens';
import { apiFetch } from '../../lib/api';

export default function Funcionarios() {
  return <EmployeeDirectoryScreen apiFetch={apiFetch} />;
}
