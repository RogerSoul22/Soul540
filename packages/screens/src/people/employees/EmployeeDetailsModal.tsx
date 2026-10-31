import { Badge } from '@soul540/ui';
import EmployeeModalFrame from './EmployeeModalFrame';
import frameStyles from './styles/EmployeeModalFrame.module.scss';
import { dayLabels, days, employeeStatusConfig, roleLabels, type Employee } from './employee-types';
import styles from './styles/EmployeeDetailsModal.module.scss';

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
}

export default function EmployeeDetailsModal({ employee, onClose, onEdit }: EmployeeDetailsModalProps) {
  if (!employee) return null;

  const status = employeeStatusConfig[employee.status];

  return (
    <EmployeeModalFrame
      footer={
        <>
          <button className={frameStyles.cancelButton} onClick={onClose}>
            Fechar
          </button>
          <button
            className={frameStyles.primaryButton}
            onClick={() => {
              onClose();
              onEdit(employee);
            }}
          >
            Editar
          </button>
        </>
      }
      onClose={onClose}
      title={<EmployeeTitle employee={employee} statusLabel={status.label} statusColor={status.color} />}
    >
      <div className={styles.grid}>
        <Detail label="Telefone (WhatsApp)" value={employee.phone || '—'} />
        <Detail label="CPF" value={employee.cpf || '—'} />
        <Detail label="RG" value={employee.rg || '—'} />
        <Detail label="Chave Pix" value={employee.pixKey || '—'} />
        <Detail full label="Endereço" value={employee.address || '—'} />
        <Detail full label="Observação" value={employee.notes || '—'} />
        <AvailabilityDetail employee={employee} />
      </div>
    </EmployeeModalFrame>
  );
}

function EmployeeTitle({
  employee,
  statusColor,
  statusLabel,
}: {
  employee: Employee;
  statusColor: 'green' | 'blue' | 'amber' | 'gray';
  statusLabel: string;
}) {
  return (
    <div className={styles.titleGroup}>
      <h2 className={styles.title}>{employee.name}</h2>
      <div className={styles.badges}>
        <Badge variant="blue">{roleLabels[employee.role]}</Badge>
        <Badge variant={statusColor}>{statusLabel}</Badge>
      </div>
    </div>
  );
}

function Detail({ full, label, value }: { full?: boolean; label: string; value: string }) {
  return (
    <div className={`${styles.field} ${full ? styles.fullField : ''}`}>
      <span className={styles.label}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function AvailabilityDetail({ employee }: { employee: Employee }) {
  const availableDays = employee.availableDays ?? [];

  return (
    <div className={`${styles.field} ${styles.fullField}`}>
      <span className={styles.label}>Dias disponíveis</span>
      {availableDays.length > 0 ? (
        <div className={styles.days}>
          {days
            .filter((day) => availableDays.includes(day))
            .map((day) => (
              <span key={day} className={styles.day}>
                {dayLabels[day]}
              </span>
            ))}
        </div>
      ) : (
        <span>—</span>
      )}
    </div>
  );
}
