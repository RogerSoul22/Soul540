import { AuditLogScreen } from '../../../../../packages/screens/src/index';
import { franchiseTitle } from '../../franchise-pwa';
import { getFranchiseSlug } from '../../franchise-path';
import { apiFetch } from '../../lib/api';
import styles from './styles/Auditoria.module.scss';

export default function Auditoria() {
  const slug = getFranchiseSlug();
  return (
    <AuditLogScreen
      apiFetch={apiFetch}
      csvPrefix={`auditoria-${slug}`}
      styles={styles}
      showUnitFilter={false}
      showSystemColumn={false}
      unitLabels={{
        franchise: franchiseTitle(slug),
      }}
    />
  );
}
