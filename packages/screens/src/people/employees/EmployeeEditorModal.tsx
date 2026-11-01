import { Button } from '../../../../pentagono/src/index';
import EmployeeEditorFields from './EmployeeEditorFields';
import EmployeeModalFrame from './EmployeeModalFrame';
import frameStyles from './styles/EmployeeModalFrame.module.scss';
import { type EmployeeForm, type UpdateEmployeeForm } from './employee-types';

interface EmployeeEditorModalProps {
  editingId: string | null;
  form: EmployeeForm;
  isOpen: boolean;
  onChange: (form: EmployeeForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}

export default function EmployeeEditorModal({
  editingId,
  form,
  isOpen,
  onChange,
  onClose,
  onSubmit,
}: EmployeeEditorModalProps) {
  if (!isOpen) return null;

  const update: UpdateEmployeeForm = (field, value) => {
    onChange({ ...form, [field]: value });
  };
  const toggleDay = (day: string) => {
    const availableDays = form.availableDays.includes(day)
      ? form.availableDays.filter((availableDay) => availableDay !== day)
      : [...form.availableDays, day];
    update('availableDays', availableDays);
  };

  return (
    <EmployeeModalFrame
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onSubmit} disabled={!form.name}>
            {editingId ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
      onClose={onClose}
      title={editingId ? 'Editar Funcionário' : 'Novo Funcionário'}
    >
      <EmployeeEditorFields form={form} onChange={update} onToggleDay={toggleDay} />
    </EmployeeModalFrame>
  );
}
