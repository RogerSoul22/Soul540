import { Button, Input, Label, Select, Textarea } from '../../../../pentagono/src/index';
import type { ReactNode } from 'react';
import { formatCpf, formatPhone, formatRg } from './employee-formatters';
import { days, dayLabels, roleLabels, type EmployeeForm, type UpdateEmployeeForm } from './employee-types';
import styles from './styles/EmployeeEditorModal.module.scss';

interface EmployeeEditorFieldsProps {
  form: EmployeeForm;
  onChange: UpdateEmployeeForm;
  onToggleDay: (day: string) => void;
}

export default function EmployeeEditorFields({ form, onChange, onToggleDay }: EmployeeEditorFieldsProps) {
  return (
    <>
      <BasicFields form={form} onChange={onChange} />
      <PersonalFields form={form} onChange={onChange} />
      <FormField label="Dias disponíveis">
        <div className={styles.dayPicker}>
          {days.map((day) => (
            <Button
              variant="chip"
              key={day}
              type="button"
              className={`${styles.dayButton} ${form.availableDays.includes(day) ? styles.activeDay : ''}`}
              onClick={() => onToggleDay(day)}
            >
              {dayLabels[day]}
            </Button>
          ))}
        </div>
      </FormField>
    </>
  );
}

function BasicFields({ form, onChange }: { form: EmployeeForm; onChange: UpdateEmployeeForm }) {
  return (
    <>
      <div className={styles.grid}>
        <FormField label="Nome *">
          <Input
            className={styles.input}
            value={form.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Nome completo"
          />
        </FormField>
        <FormField label="Cargo">
          <Select
            className={styles.input}
            value={form.role}
            onChange={(event) => onChange('role', event.target.value as EmployeeForm['role'])}
          >
            {Object.entries(roleLabels).map(([role, label]) => (
              <option key={role} value={role}>
                {label}
              </option>
            ))}
          </Select>
        </FormField>
      </div>
      <div className={styles.grid}>
        <FormField label="Telefone (WhatsApp)">
          <Input
            className={styles.input}
            value={form.phone}
            onChange={(event) => onChange('phone', formatPhone(event.target.value))}
            placeholder="(11) 99999-9999"
          />
        </FormField>
        <FormField label="Status">
          <Select
            className={styles.input}
            value={form.status}
            onChange={(event) => onChange('status', event.target.value as EmployeeForm['status'])}
          >
            <option value="ativo">Ativo</option>
            <option value="ferias">Férias</option>
            <option value="afastado">Afastado</option>
            <option value="desligado">Desligado</option>
          </Select>
        </FormField>
      </div>
    </>
  );
}

function PersonalFields({ form, onChange }: { form: EmployeeForm; onChange: UpdateEmployeeForm }) {
  return (
    <>
      <div className={styles.grid}>
        <FormField label="CPF">
          <Input
            className={styles.input}
            value={form.cpf}
            onChange={(event) => onChange('cpf', formatCpf(event.target.value))}
            placeholder="000.000.000-00"
          />
        </FormField>
        <FormField label="RG">
          <Input
            className={styles.input}
            value={form.rg}
            onChange={(event) => onChange('rg', formatRg(event.target.value))}
            placeholder="00.000.000-0"
          />
        </FormField>
      </div>
      <FormField label="Endereço">
        <Input
          className={styles.input}
          value={form.address}
          onChange={(event) => onChange('address', event.target.value)}
          placeholder="Rua, número, bairro, cidade"
        />
      </FormField>
      <FormField label="Chave Pix">
        <Input
          className={styles.input}
          value={form.pixKey}
          onChange={(event) => onChange('pixKey', event.target.value)}
          placeholder="CPF, e-mail, telefone ou chave aleatória"
        />
      </FormField>
      <FormField label="Comissão por evento (%)">
        <Input
          className={styles.input}
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={form.commissionRate}
          onChange={(event) => onChange('commissionRate', event.target.value)}
        />
      </FormField>
      <FormField label="Observação">
        <Textarea
          className={`${styles.input} ${styles.textarea}`}
          value={form.notes}
          onChange={(event) => onChange('notes', event.target.value)}
          placeholder="Anotações sobre o funcionário..."
          rows={3}
        />
      </FormField>
    </>
  );
}

function FormField({ children, label }: { children: ReactNode; label: string }) {
  return (
    <Label className={styles.formGroup}>
      <span className={styles.label}>{label}</span>
      {children}
    </Label>
  );
}
