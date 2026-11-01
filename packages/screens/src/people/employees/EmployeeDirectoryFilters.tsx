import { Input, Select } from '../../../../pentagono/src/index';
import { SearchIcon } from './employee-icons';
import { roleLabels } from './employee-types';
import filterStyles from './styles/EmployeeDirectoryFilters.module.scss';

interface EmployeeDirectoryFiltersProps {
  search: string;
  statusFilter: string;
  roleFilter: string;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (filter: string) => void;
  onRoleFilterChange: (filter: string) => void;
}

export default function EmployeeDirectoryFilters({
  search,
  statusFilter,
  roleFilter,
  onSearchChange,
  onStatusFilterChange,
  onRoleFilterChange,
}: EmployeeDirectoryFiltersProps) {
  return (
    <div className={filterStyles.controls}>
      <div className={filterStyles.searchWrap}>
        <SearchIcon className={filterStyles.searchIcon} width="16" height="16" />
        <Input
          variant="search"
          className={filterStyles.searchInput}
          placeholder="Buscar por nome, email, CPF, cidade..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <Select
        variant="compact"
        className={filterStyles.select}
        value={statusFilter}
        onChange={(event) => onStatusFilterChange(event.target.value)}
      >
        <option value="all">Todos os status</option>
        <option value="ativo">Ativo</option>
        <option value="ferias">Férias</option>
        <option value="afastado">Afastado</option>
        <option value="desligado">Desligado</option>
      </Select>
      <Select
        variant="compact"
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
      </Select>
    </div>
  );
}
