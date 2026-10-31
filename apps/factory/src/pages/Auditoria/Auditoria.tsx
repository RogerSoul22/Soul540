import { AuditLogScreen } from '../../../../../packages/screens/src/index';
import { apiFetch } from '../../lib/api';
import styles from './styles/Auditoria.module.scss';

export default function Auditoria() {
  return (
    <AuditLogScreen
      apiFetch={apiFetch}
      csvPrefix="auditoria-fabrica"
      styles={styles}
      unitLabels={{ main: 'Principal', franchise: 'Itu', factory: 'Fábrica' }}
    />
  );
}
