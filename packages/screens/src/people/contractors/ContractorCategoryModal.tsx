import { useState, type RefObject } from 'react';
import ContractorModalFrame from './ContractorModalFrame';
import styles from './styles/ContractorModalFrame.module.scss';

interface ContractorCategoryModalProps {
  inputRef: RefObject<HTMLInputElement>;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
}

export default function ContractorCategoryModal({ inputRef, isOpen, onClose, onSubmit }: ContractorCategoryModalProps) {
  const [name, setName] = useState('');
  if (!isOpen) return null;
  const close = () => {
    setName('');
    onClose();
  };
  const submit = async () => {
    await onSubmit(name);
    close();
  };
  return (
    <ContractorModalFrame
      footer={
        <>
          <button className={styles.cancelButton} onClick={close}>
            Cancelar
          </button>
          <button className={styles.primaryButton} disabled={!name.trim()} onClick={submit}>
            Adicionar
          </button>
        </>
      }
      onClose={close}
      title="Nova categoria"
      width="narrow"
    >
      <div className={styles.field}>
        <label>Nome da categoria</label>
        <input
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void submit();
            if (event.key === 'Escape') close();
          }}
          placeholder="Ex: Corporativo, Casamento..."
          ref={inputRef}
          value={name}
        />
      </div>
    </ContractorModalFrame>
  );
}
