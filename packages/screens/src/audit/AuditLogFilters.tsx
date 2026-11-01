import { Select } from '../../../pentagono/src/index';
import type { AuditLogStyles } from './AuditLogScreen';
import { resourceLabels } from './audit-types';

type Props = {
  styles: AuditLogStyles;
  unitLabels: Record<string, string>;
  resource: string;
  unit: string;
  onResourceChange: (value: string) => void;
  onUnitChange: (value: string) => void;
};

export default function AuditLogFilters({ styles, unitLabels, resource, unit, onResourceChange, onUnitChange }: Props) {
  return (
    <div className={styles.filters}>
      <Select className={styles.select} value={resource} onChange={(event) => onResourceChange(event.target.value)}>
        <option value="">Todos os recursos</option>
        {Object.entries(resourceLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
      <Select className={styles.select} value={unit} onChange={(event) => onUnitChange(event.target.value)}>
        <option value="">Todos os sistemas</option>
        {Object.entries(unitLabels).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </Select>
    </div>
  );
}
