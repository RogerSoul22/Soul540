import { Badge } from '@soul540/ui';
import { displayCategory } from './contractor-formatters';
import ContractorModalFrame from './ContractorModalFrame';
import { contractorStatusConfig, type Contractor } from './contractor-types';
import styles from './styles/ContractorModalFrame.module.scss';

const maritalStatusLabels: Record<string, string> = {
  solteiro: 'Solteiro(a)',
  casado: 'Casado(a)',
  divorciado: 'Divorciado(a)',
  viuvo: 'Viúvo(a)',
  uniao_estavel: 'União estável',
};

export default function ContractorDetailsModal({
  contractor,
  onClose,
  onEdit,
}: {
  contractor: Contractor | null;
  onClose: () => void;
  onEdit: (contractor: Contractor) => void;
}) {
  if (!contractor) return null;
  const individual = contractor.type === 'pessoa_fisica';
  return (
    <ContractorModalFrame
      footer={
        <>
          <button className={styles.cancelButton} onClick={onClose}>
            Fechar
          </button>
          <button
            className={styles.primaryButton}
            onClick={() => {
              onClose();
              onEdit(contractor);
            }}
          >
            Editar
          </button>
        </>
      }
      onClose={onClose}
      title={contractor.name}
    >
      <div className={styles.badges}>
        <Badge variant={individual ? 'gray' : 'blue'}>{individual ? 'Pessoa Física' : 'Pessoa Jurídica'}</Badge>
        <Badge variant={contractorStatusConfig[contractor.status].color}>
          {contractorStatusConfig[contractor.status].label}
        </Badge>
      </div>
      <div className={styles.detailsGrid}>
        <Detail label="Telefone" value={contractor.phone} />
        <Detail label="E-mail" value={contractor.email} />
        <Detail label="Cidade" value={contractor.city} />
        <Detail full label="Endereço" value={contractor.address} />
        <Detail label="Tipo de documento" value={contractor.documentType} />
        <Detail label="Número do documento" value={contractor.document} />
        <Detail label="Categoria" value={contractor.category && displayCategory(contractor.category)} />
        {individual ? <Detail label="Profissão" value={contractor.profession} /> : null}
        {individual ? (
          <Detail
            label="Estado civil"
            value={contractor.maritalStatus && maritalStatusLabels[contractor.maritalStatus]}
          />
        ) : null}
      </div>
    </ContractorModalFrame>
  );
}

function Detail({ full = false, label, value }: { full?: boolean; label: string; value?: string }) {
  return (
    <div className={`${styles.detail} ${full ? styles.full : ''}`}>
      <small>{label}</small>
      <span>{value || '—'}</span>
    </div>
  );
}
