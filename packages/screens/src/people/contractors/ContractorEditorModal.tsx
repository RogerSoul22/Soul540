import { formatDocument, formatPhone } from './contractor-formatters';
import ContractorModalFrame from './ContractorModalFrame';
import { type ContractorForm, type ContractorType } from './contractor-types';
import { EditorField, EditorFooter, IndividualDocumentOptions, IndividualFields } from './ContractorEditorParts';
import styles from './styles/ContractorModalFrame.module.scss';

interface ContractorEditorModalProps {
  categories: string[];
  editingId: string | null;
  form: ContractorForm;
  isOpen: boolean;
  onChange: (form: ContractorForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function ContractorEditorModal({
  categories,
  editingId,
  form,
  isOpen,
  onChange,
  onClose,
  onSubmit,
}: ContractorEditorModalProps) {
  if (!isOpen) return null;
  const isIndividual = form.type === 'pessoa_fisica';
  const update = <Field extends keyof ContractorForm>(field: Field, value: ContractorForm[Field]) => {
    onChange({ ...form, [field]: value });
  };
  const changeType = (type: ContractorType) => {
    onChange({
      ...form,
      type,
      maritalStatus: '',
      profession: '',
      documentType: type === 'pessoa_juridica' ? 'CNPJ' : '',
      document: '',
    });
  };

  return (
    <ContractorModalFrame
      footer={<EditorFooter editingId={editingId} onClose={onClose} onSubmit={onSubmit} valid={Boolean(form.name)} />}
      onClose={onClose}
      title={editingId ? 'Editar Contratante' : 'Adicionar Contratante'}
    >
      <EditorField label="Tipo de pessoa">
        <select onChange={(event) => changeType(event.target.value as ContractorType)} value={form.type}>
          <option value="pessoa_fisica">Pessoa Física</option>
          <option value="pessoa_juridica">Pessoa Jurídica</option>
        </select>
      </EditorField>
      <EditorField label={isIndividual ? 'Nome do responsável *' : 'Nome da empresa / Razão social *'}>
        <input onChange={(event) => update('name', event.target.value)} value={form.name} />
      </EditorField>
      <div className={styles.twoColumns}>
        <EditorField label="Telefone">
          <input onChange={(event) => update('phone', formatPhone(event.target.value))} value={form.phone} />
        </EditorField>
        <EditorField label="Cidade">
          <input onChange={(event) => update('city', event.target.value)} value={form.city} />
        </EditorField>
      </div>
      <EditorField label="Endereço">
        <input onChange={(event) => update('address', event.target.value)} value={form.address} />
      </EditorField>
      {isIndividual ? <IndividualFields form={form} update={update} /> : null}
      <div className={styles.twoColumns}>
        <EditorField label="Tipo de documento">
          <select
            disabled={!isIndividual}
            onChange={(event) => onChange({ ...form, documentType: event.target.value, document: '' })}
            value={form.documentType}
          >
            {isIndividual ? <IndividualDocumentOptions /> : <option value="CNPJ">CNPJ</option>}
          </select>
        </EditorField>
        <EditorField label="Número do documento">
          <input
            disabled={!form.documentType}
            onChange={(event) => update('document', formatDocument(event.target.value, form.documentType))}
            value={form.document}
          />
        </EditorField>
      </div>
      <div className={styles.twoColumns}>
        <EditorField label="Categoria">
          <select onChange={(event) => update('category', event.target.value)} value={form.category}>
            <option value="">Selecione uma categoria</option>
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </EditorField>
        <EditorField label="Status">
          <select
            onChange={(event) => update('status', event.target.value as ContractorForm['status'])}
            value={form.status}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="bloqueado">Bloqueado</option>
          </select>
        </EditorField>
      </div>
      <EditorField label="E-mail">
        <input onChange={(event) => update('email', event.target.value)} type="email" value={form.email} />
      </EditorField>
    </ContractorModalFrame>
  );
}
