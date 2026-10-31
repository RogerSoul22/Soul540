import type { EventFormController } from '../types/event-form-controller';
import styles from '../styles/Eventos.module.scss';

export default function EventFormTeam({ controller }: { controller: EventFormController }) {
  const { form, setForm, employees, roleLabels, toggleEmployee, availabilityConflicts } = controller;
  return (
    <>
      {/* — Equipe — */}
      <div className={styles.formSection}>
        <p className={styles.formSectionTitle}>Equipe Soul540</p>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Pizzaio(a)</label>
            <select
              className={styles.input}
              value={form.teamPizzaiolo}
              onChange={(e) => setForm({ ...form, teamPizzaiolo: e.target.value })}
            >
              <option value="">Selecionar</option>
              {employees
                .filter((e) => e.status === 'ativo')
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Ajudante</label>
            <select
              className={styles.input}
              value={form.teamHelper}
              onChange={(e) => setForm({ ...form, teamHelper: e.target.value })}
            >
              <option value="">Selecionar</option>
              {employees
                .filter((e) => e.status === 'ativo')
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Garçon</label>
            <select
              className={styles.input}
              value={form.teamGarcon}
              onChange={(e) => setForm({ ...form, teamGarcon: e.target.value })}
            >
              <option value="">Selecionar</option>
              {employees
                .filter((e) => e.status === 'ativo')
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Funcionario Responsavel</label>
            <select
              className={styles.input}
              value={form.responsibleEmployeeId}
              onChange={(e) => setForm({ ...form, responsibleEmployeeId: e.target.value })}
            >
              <option value="">Selecionar</option>
              {employees
                .filter((e) => e.status === 'ativo')
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Extras — Louças (pessoas)</label>
            <input
              className={styles.input}
              type="number"
              value={form.extrasLoucas}
              onChange={(e) => setForm({ ...form, extrasLoucas: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Extras — Bebidas (pessoas)</label>
            <input
              className={styles.input}
              type="number"
              value={form.extrasBebidas}
              onChange={(e) => setForm({ ...form, extrasBebidas: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Funcionarios no Evento ({form.selectedEmployeeIds.length} selecionados)
          </label>
          <div className={styles.checkList}>
            {employees
              .filter((emp) => emp.status === 'ativo')
              .map((emp) => (
                <label key={emp.id} className={styles.checkItem} onClick={() => toggleEmployee(emp.id)}>
                  <input type="checkbox" checked={form.selectedEmployeeIds.includes(emp.id)} readOnly />
                  <span className={styles.checkLabel}>
                    {emp.name} <span>{roleLabels[emp.role]}</span>
                  </span>
                </label>
              ))}
          </div>
        </div>
        {availabilityConflicts.length > 0 && (
          <div className={styles.availabilityWarning}>
            {availabilityConflicts.map((conflict) => (
              <span key={`${conflict.employeeId}-${conflict.eventName}`}>
                {conflict.employeeName} ja esta em {conflict.eventName} nesta data.
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
