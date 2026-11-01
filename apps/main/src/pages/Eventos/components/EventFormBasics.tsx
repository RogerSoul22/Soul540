import { Button, Input, Label } from '../../../../../../packages/pentagono/src/index';
import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';
import EventFormModality from './EventFormModality';

export default function EventFormBasics({ controller }: { controller: EventFormController }) {
  const { form, setForm, formatPhone, handleLocationImageFile } = controller;
  return (
    <>
      {/* — Categoria — */}
      <div className={styles.statusToggle}>
        <Button
          variant="chip"
          type="button"
          className={`${styles.statusBtn} ${form.status === 'planning' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'planning' })}
        >
          Orçamento
        </Button>
        <Button
          variant="chip"
          type="button"
          className={`${styles.statusBtn} ${form.status === 'confirmed' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'confirmed' })}
        >
          Fechado
        </Button>
        <Button
          variant="chip"
          type="button"
          className={`${styles.statusBtn} ${form.status === 'completed' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'completed' })}
        >
          Finalizado
        </Button>
        <Button
          variant="chip"
          type="button"
          className={`${styles.statusBtn} ${form.status === 'cancelled' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'cancelled' })}
        >
          Cancelado
        </Button>
      </div>

      {/* — Identificação — */}
      <div className={styles.formGroup}>
        <Input
          label="Nome do Evento *"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex: Casamento Silva"
        />
      </div>

      <div className={styles.formGroup}>
        <Input
          label="O que estamos celebrando"
          value={form.celebration}
          onChange={(e) => setForm({ ...form, celebration: e.target.value })}
          placeholder="Ex: Casamento, Aniversário, Confraternização..."
        />
      </div>

      <EventFormModality controller={controller} />

      <div className={styles.formGrid2}>
        <div className={styles.formGroup}>
          <Input
            label="Data Inicial *"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <Input
            label="Data Final"
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formGrid2}>
        <div className={styles.formGroup}>
          <Input
            label="Horario de Inicio"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <Input
            label="Equipe chega"
            type="time"
            value={form.teamArrivalTime}
            onChange={(e) => setForm({ ...form, teamArrivalTime: e.target.value })}
          />
        </div>
      </div>

      {/* — Local — */}
      <div className={styles.formSection}>
        <p className={styles.formSectionTitle}>Local</p>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Input
              label="Cidade"
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              label="Telefone de Contato"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              placeholder="(11) 99999-0000"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <Input
            label="Endereco do Evento *"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Ex: Salao Premium - Centro SP"
          />
        </div>
        <div className={styles.formGroup}>
          <Label className={styles.label}>Imagem do Local</Label>
          <Label className={`${styles.fileUploadBtn} ${form.locationImageName ? styles.fileSelected : ''}`}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {form.locationImageName || 'Enviar foto do local das pizzas'}
            <Input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLocationImageFile} />
          </Label>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Nos ajuda a dimensionar os equipamentos necessários
          </p>
        </div>
      </div>
    </>
  );
}
