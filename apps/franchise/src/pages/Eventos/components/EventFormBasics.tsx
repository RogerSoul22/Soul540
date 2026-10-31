import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';
import EventFormModality from './EventFormModality';

export default function EventFormBasics({ controller }: { controller: EventFormController }) {
  const { form, setForm, formatPhone, handleLocationImageFile } = controller;
  return (
    <>
      {/* — Categoria — */}
      <div className={styles.statusToggle}>
        <button
          type="button"
          className={`${styles.statusBtn} ${form.status === 'planning' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'planning' })}
        >
          Orçamento
        </button>
        <button
          type="button"
          className={`${styles.statusBtn} ${form.status === 'confirmed' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'confirmed' })}
        >
          Fechado
        </button>
        <button
          type="button"
          className={`${styles.statusBtn} ${form.status === 'completed' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'completed' })}
        >
          Finalizado
        </button>
        <button
          type="button"
          className={`${styles.statusBtn} ${form.status === 'cancelled' ? styles.statusBtnActive : ''}`}
          onClick={() => setForm({ ...form, status: 'cancelled' })}
        >
          Cancelado
        </button>
      </div>

      {/* — Identificação — */}
      <div className={styles.formGroup}>
        <label className={styles.label}>Nome do Evento *</label>
        <input
          className={styles.input}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Ex: Casamento Silva"
        />
      </div>

      <EventFormModality controller={controller} />

      <div className={styles.formGroup}>
        <label className={styles.label}>O que estamos celebrando</label>
        <input
          className={styles.input}
          value={form.celebration}
          onChange={(e) => setForm({ ...form, celebration: e.target.value })}
          placeholder="Ex: Casamento, Aniversário, Confraternização..."
        />
      </div>

      <div className={styles.formGrid2}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Data Inicial *</label>
          <input
            className={styles.input}
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Data Final</label>
          <input
            className={styles.input}
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
      </div>

      <div className={styles.formGrid2}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Horario de Inicio</label>
          <input
            className={styles.input}
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Equipe chega</label>
          <input
            className={styles.input}
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
            <label className={styles.label}>Cidade</label>
            <input
              className={styles.input}
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Telefone de Contato</label>
            <input
              className={styles.input}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
              placeholder="(11) 99999-0000"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Endereco do Evento *</label>
          <input
            className={styles.input}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="Ex: Salao Premium - Centro SP"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Imagem do Local</label>
          <label className={`${styles.fileUploadBtn} ${form.locationImageName ? styles.fileSelected : ''}`}>
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
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLocationImageFile} />
          </label>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            Nos ajuda a dimensionar os equipamentos necessários
          </p>
        </div>
      </div>
    </>
  );
}
