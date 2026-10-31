import type { TaskPriority } from '../../../../../../shared/contracts/types';
import type { TaskFormData } from '../types/task-types';
import styles from '../styles/Tarefas.module.scss';

type Props = {
  form: TaskFormData;
  events: Array<{ id: string; name: string }>;
  onChange: <Key extends keyof TaskFormData>(key: Key, value: TaskFormData[Key]) => void;
  onCreate: () => void;
  onClose: () => void;
};

export default function TaskCreateModal({ form, events, onChange, onCreate, onClose }: Props) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Nova Tarefa</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.formGroup}>
            <span className={styles.label}>Título *</span>
            <input
              className={styles.input}
              value={form.title}
              onChange={(event) => onChange('title', event.target.value)}
            />
          </label>
          <label className={styles.formGroup}>
            <span className={styles.label}>Descrição</span>
            <textarea
              className={styles.textarea}
              rows={2}
              value={form.description}
              onChange={(event) => onChange('description', event.target.value)}
            />
          </label>
          <div className={styles.formGrid2}>
            <label className={styles.formGroup}>
              <span className={styles.label}>Prioridade</span>
              <select
                className={styles.input}
                value={form.priority}
                onChange={(event) => onChange('priority', event.target.value as TaskPriority)}
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </label>
            <label className={styles.formGroup}>
              <span className={styles.label}>Responsável</span>
              <input
                className={styles.input}
                value={form.assignee}
                onChange={(event) => onChange('assignee', event.target.value)}
              />
            </label>
          </div>
          <div className={styles.formGrid2}>
            <label className={styles.formGroup}>
              <span className={styles.label}>Prazo</span>
              <input
                className={styles.input}
                type="date"
                value={form.dueDate}
                onChange={(event) => onChange('dueDate', event.target.value)}
              />
            </label>
            <label className={styles.formGroup}>
              <span className={styles.label}>Evento</span>
              <select
                className={styles.input}
                value={form.eventId}
                onChange={(event) => onChange('eventId', event.target.value)}
              >
                <option value="">Nenhum</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={onCreate} disabled={!form.title.trim()}>
            Criar Tarefa
          </button>
        </div>
      </div>
    </div>
  );
}
