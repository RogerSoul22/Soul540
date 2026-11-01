import { Heading } from '../Heading/Heading';
import styles from './PageHeader.module.css';
import type { PageHeaderProps } from './type';

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  titleExtra,
  notice,
  actions,
  variant = 'default',
  className = '',
}: PageHeaderProps) {
  return (
    <header className={`${styles.header} ${styles[variant]} ${className}`.trim()}>
      <div>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <div className={styles.titleRow}>
          <Heading className={styles.title}>{title}</Heading>
          {titleExtra}
        </div>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {notice && <p className={styles.notice}>{notice}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}
