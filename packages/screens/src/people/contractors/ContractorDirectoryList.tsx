import { Badge } from '@soul540/ui';
import { displayCategory } from './contractor-formatters';
import { contractorStatusConfig, type Contractor } from './contractor-types';
import styles from './styles/ContractorDirectoryList.module.scss';

interface ContractorDirectoryListProps {
  contractorsByLetter: Map<string, Contractor[]>;
  loading: boolean;
  onDelete: (id: string) => void;
  onEdit: (contractor: Contractor) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onView: (contractor: Contractor) => void;
  search: string;
  statusFilter: string;
  typeFilter: string;
}

export default function ContractorDirectoryList({
  contractorsByLetter,
  loading,
  onDelete,
  onEdit,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
  onView,
  search,
  statusFilter,
  typeFilter,
}: ContractorDirectoryListProps) {
  return (
    <>
      <section className={styles.controls} aria-label="Filtros de contratantes">
        <input
          className={styles.searchInput}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar contratantes..."
          value={search}
        />
        <select onChange={(event) => onStatusFilterChange(event.target.value)} value={statusFilter}>
          <option value="all">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="bloqueado">Bloqueado</option>
        </select>
        <select onChange={(event) => onTypeFilterChange(event.target.value)} value={typeFilter}>
          <option value="all">Todos os tipos</option>
          <option value="pessoa_fisica">Pessoa Física</option>
          <option value="pessoa_juridica">Pessoa Jurídica</option>
        </select>
      </section>
      {loading ? <p className={styles.empty}>Carregando...</p> : null}
      {!loading && contractorsByLetter.size === 0 ? (
        <p className={styles.empty}>Nenhum contratante encontrado.</p>
      ) : null}
      {[...contractorsByLetter].map(([letter, contractors]) => (
        <section className={styles.letterSection} key={letter}>
          <h2>{letter}</h2>
          <div className={styles.grid}>
            {contractors.map((contractor) => (
              <ContractorCard
                contractor={contractor}
                key={contractor.id}
                onDelete={onDelete}
                onEdit={onEdit}
                onView={onView}
              />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function ContractorCard({
  contractor,
  onDelete,
  onEdit,
  onView,
}: {
  contractor: Contractor;
  onDelete: (id: string) => void;
  onEdit: (contractor: Contractor) => void;
  onView: (contractor: Contractor) => void;
}) {
  const whatsappUrl = `https://wa.me/55${contractor.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
    'Olá! Teria interesse em fechar um evento conosco?',
  )}`;
  return (
    <article className={styles.card} onClick={() => onView(contractor)}>
      <div className={styles.cardHeader}>
        <strong>{contractor.name}</strong>
        <div className={styles.cardActions}>
          {contractor.phone ? (
            <a href={whatsappUrl} onClick={(event) => event.stopPropagation()} target="_blank">
              WhatsApp
            </a>
          ) : null}
          <button onClick={(event) => edit(event, contractor, onEdit)}>Editar</button>
          <button onClick={(event) => remove(event, contractor.id, onDelete)}>Excluir</button>
        </div>
      </div>
      {contractor.phone ? <span>{contractor.phone}</span> : null}
      {contractor.email ? <span>{contractor.email}</span> : null}
      {contractor.category ? (
        <div className={styles.badges}>
          <Badge>{displayCategory(contractor.category)}</Badge>
          <Badge variant={contractorStatusConfig[contractor.status].color}>
            {contractorStatusConfig[contractor.status].label}
          </Badge>
        </div>
      ) : null}
    </article>
  );
}

function edit(event: React.MouseEvent, contractor: Contractor, onEdit: (item: Contractor) => void) {
  event.stopPropagation();
  onEdit(contractor);
}

function remove(event: React.MouseEvent, id: string, onDelete: (target: string) => void) {
  event.stopPropagation();
  onDelete(id);
}
