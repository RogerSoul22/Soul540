import { Button, Input } from '../../../../pentagono/src/index';
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
          <Button variant="ghost" onClick={close}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!name.trim()} onClick={submit}>
            Adicionar
          </Button>
        </>
      }
      onClose={close}
      title="Nova categoria"
      width="narrow"
    >
      <div className={styles.field}>
        <Input
          label="Nome da categoria"
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
