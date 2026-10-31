import type { ReactNode } from 'react';
import { Badge } from '@soul540/ui';
import { LocationIcon, PhoneIcon, SearchIcon } from './employee-icons';
import { dayLabels, days, employeeStatusConfig, roleLabels, type Employee } from './employee-types';
import cardStyles from './styles/EmployeeDirectoryCards.module.scss';
import filterStyles from './styles/EmployeeDirectoryFilters.module.scss';
interface EmployeeDirectoryListProps {
  employeesByLetter: Map<string, Employee[]>;
  loading: boolean;
  onDelete: (employeeId: string) => void;
  onEdit: (employee: Employee) => void;
  onRoleFilterChange: (filter: string) => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (filter: string) => void;
  onView: (employee: Employee) => void;
  roleFilter: string;
  search: string;
  statusFilter: string;
  total: number;
}
export default function EmployeeDirectoryList({
  employeesByLetter,
  loading,
  onDelete,
  onEdit,
  onRoleFilterChange,
  onSearchChange,
  onStatusFilterChange,
  onView,
  roleFilter,
  search,
  statusFilter,
  total,
}: EmployeeDirectoryListProps) {
  return (
    <>
      <div className={filterStyles.controls}>
        <div className={filterStyles.searchWrap}>
          <SearchIcon className={filterStyles.searchIcon} width="16" height="16" />
          <input
            className={filterStyles.searchInput}
            placeholder="Buscar por nome, email, CPF, cidade..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
        <select
          className={filterStyles.select}
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value)}
        >
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="ferias">Férias</option>
          <option value="afastado">Afastado</option>
          <option value="desligado">Desligado</option>
        </select>
        <select
          className={filterStyles.select}
          value={roleFilter}
          onChange={(event) => onRoleFilterChange(event.target.value)}
        >
          <option value="all">Todos os cargos</option>
          {Object.entries(roleLabels).map(([role, label]) => (
            <option key={role} value={role}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className={cardStyles.empty}>Carregando...</div>
      ) : total === 0 ? (
        <div className={cardStyles.empty}>Nenhum funcionário encontrado.</div>
      ) : (
        Array.from(employeesByLetter.entries()).map(([letter, employees]) => (
          <section key={letter} className={cardStyles.letterSection}>
            <div className={cardStyles.letterDivider}>
              <span className={cardStyles.letterLabel}>{letter}</span>
            </div>
            <div className={cardStyles.grid}>
              {employees.map((employee) => (
                <EmployeeCard
                  key={employee.id}
                  employee={employee}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </>
  );
}

function EmployeeCard({
  employee,
  onDelete,
  onEdit,
  onView,
}: {
  employee: Employee;
  onDelete: (employeeId: string) => void;
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
}) {
  const status = employeeStatusConfig[employee.status];

  return (
    <article className={cardStyles.card} onClick={() => onView(employee)}>
      <div className={cardStyles.cardTop}>
        <div className={cardStyles.cardAvatar}>{employee.name.charAt(0)}</div>
        <div className={cardStyles.cardInfo}>
          <p className={cardStyles.cardName}>{employee.name}</p>
          <p className={cardStyles.cardRole}>{roleLabels[employee.role]}</p>
        </div>
        <Badge variant={status.color}>{status.label}</Badge>
      </div>
      <div className={cardStyles.cardDetails}>
        {employee.phone && <Detail icon={<PhoneIcon />} value={employee.phone} />}
        {employee.address && <Detail icon={<LocationIcon />} value={employee.address} />}
      </div>
      {employee.availableDays && employee.availableDays.length > 0 && (
        <div className={cardStyles.cardDays}>
          {days
            .filter((day) => employee.availableDays?.includes(day))
            .map((day) => (
              <span key={day} className={cardStyles.dayTag}>
                {dayLabels[day]}
              </span>
            ))}
        </div>
      )}
      <div className={cardStyles.cardActions}>
        <button
          className={cardStyles.editButton}
          onClick={(event) => {
            event.stopPropagation();
            onEdit(employee);
          }}
        >
          Editar
        </button>
        <button
          className={cardStyles.deleteButton}
          onClick={(event) => {
            event.stopPropagation();
            onDelete(employee.id);
          }}
        >
          Excluir
        </button>
      </div>
    </article>
  );
}

function Detail({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className={cardStyles.detailRow}>
      {icon}
      {value}
    </div>
  );
}
