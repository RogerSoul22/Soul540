import type { FranchiseStatus, PortalSystem } from '../types/franchise-types';
import styles from '../styles/Franquias.module.scss';

type Props = { system: PortalSystem; franchiseName?: string; status: FranchiseStatus };

export default function PortalCard({ system, franchiseName, status }: Props) {
  const label = franchiseName || (system === 'franchise' ? 'Franquia Itu' : 'Portal Fábrica');
  const color = system === 'franchise' ? styles.portalAmber : styles.portalBlue;
  const statusLabel = status === 'ativa' ? 'Ativa' : 'Em implantação';

  return (
    <div className={styles.portalCard + ' ' + color}>
      <div className={styles.portalTop}>
        <div className={styles.portalIcon}>{system === 'franchise' ? '⌘' : '▣'}</div>
        <div>
          <div className={styles.portalLabel}>{label}</div>
          <div className={styles.portalSub}>Sistema {system}</div>
        </div>
        <div className={styles.portalStatus}>
          <span className={styles.statusDot + ' ' + styles.statusOnline} />
          <span className={styles.statusLabel}>{statusLabel}</span>
        </div>
      </div>
      <div className={styles.portalStats}>
        <Stat value={statusLabel} label="Status da franquia" />
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className={styles.portalStat}>
      <span className={styles.portalStatValue}>{value}</span>
      <span className={styles.portalStatLabel}>{label}</span>
    </div>
  );
}
