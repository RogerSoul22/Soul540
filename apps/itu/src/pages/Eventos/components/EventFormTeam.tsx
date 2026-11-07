import { Input, Label, Select } from '../../../../../../packages/pentagono/src/index';
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
            <Select
              label="Pizzaio(a)"
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
            </Select>
          </div>
          <div className={styles.formGroup}>
            <Select
              label="Ajudante"
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
            </Select>
          </div>
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Select
              label="Garçon"
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
            </Select>
          </div>
          <div className={styles.formGroup}>
            <Select
              label="Funcionario Responsavel"
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
            </Select>
          </div>
        </div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Input
              label="Extras — Louças (pessoas)"
              type="number"
              value={form.extrasLoucas}
              onChange={(e) => setForm({ ...form, extrasLoucas: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
          <div className={styles.formGroup}>
            <Input
              label="Extras — Bebidas (pessoas)"
              type="number"
              value={form.extrasBebidas}
              onChange={(e) => setForm({ ...form, extrasBebidas: e.target.value })}
              placeholder="0"
              min="0"
            />
          </div>
        </div>
        <div className={styles.formGroup}>
          <Label className={styles.label}>
            Funcionarios no Evento ({form.selectedEmployeeIds.length} selecionados)
          </Label>
          <div className={styles.checkList}>
            {employees
              .filter((emp) => emp.status === 'ativo')
              .map((emp) => (
                <Label key={emp.id} className={styles.checkItem} onClick={() => toggleEmployee(emp.id)}>
                  <Input type="checkbox" checked={form.selectedEmployeeIds.includes(emp.id)} readOnly />
                  <span className={styles.checkLabel}>
                    {emp.name} <span>{roleLabels[emp.role]}</span>
                  </span>
                </Label>
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
