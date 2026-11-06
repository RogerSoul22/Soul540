import { Badge, type BadgeVariant, Heading } from '../../../../../../packages/pentagono/src/index';
import type { FranchiseStatus, PortalSystem } from '../types/franchise-types';
import styles from '../styles/Franquias.module.scss';

type Props = { system: PortalSystem; franchiseName?: string; status: FranchiseStatus };

const SYSTEM_LABEL: Record<PortalSystem, string> = { franchise: 'Franquia', factory: 'Fábrica' };

const STATUS_META: Record<FranchiseStatus, { label: string; variant: BadgeVariant; online: boolean }> = {
  ativa: { label: 'Ativa', variant: 'green', online: true },
  em_implantacao: { label: 'Em implantação', variant: 'amber', online: false },
  congelada: { label: 'Congelada', variant: 'blue', online: false },
  suspensa: { label: 'Suspensa', variant: 'red', online: false },
  encerrada: { label: 'Encerrada', variant: 'gray', online: false },
};

export default function PortalCard({ system, franchiseName, status }: Props) {
  const label = franchiseName || (system === 'franchise' ? 'Franquia Campinas' : 'Portal Fábrica');
  const { label: statusLabel, variant, online } = STATUS_META[status] ?? STATUS_META.em_implantacao;
  const accent = system === 'franchise' ? styles.portalAmber : styles.portalBlue;

  return (
    <article className={`${styles.portalCard} ${accent}`}>
      <header className={styles.portalTop}>
        <div className={styles.portalIcon} aria-hidden="true">
          {system === 'franchise' ? '⌘' : '▣'}
        </div>
        <div className={styles.portalHeading}>
          <Heading level={3} variant="section" className={styles.portalLabel}>
            {label}
          </Heading>
          <p className={styles.portalSub}>Portal {SYSTEM_LABEL[system].toLowerCase()}</p>
        </div>
        <Badge variant={variant}>{statusLabel}</Badge>
      </header>
      <dl className={styles.portalDetails}>
        <div className={styles.portalDetail}>
          <dt>Sistema</dt>
          <dd>{SYSTEM_LABEL[system]}</dd>
        </div>
        <div className={styles.portalDetail}>
          <dt>Status da franquia</dt>
          <dd>
            <span className={`${styles.statusDot} ${online ? styles.statusOnline : styles.statusPending}`} />
            {statusLabel}
          </dd>
        </div>
      </dl>
    </article>
  );
}
