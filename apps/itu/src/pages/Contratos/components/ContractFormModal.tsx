import {
  Button,
  Checkbox,
  Input,
  Label,
  Modal,
  Select,
  Textarea,
} from '../../../../../../packages/pentagono/src/index';
import { SOUL540_MENUS } from '../../../data/soul540Menus/index';
import { maskCpf, maskCurrency, maskPhone, maskRg } from '../../../../../../packages/screens/src/index';
import type { ContractEvents, FormData } from '../types/contract-types';
import styles from '../styles/Contratos.module.scss';

type Props = {
  form: FormData;
  editing: boolean;
  events: ContractEvents;
  onChange: (field: keyof FormData, value: string | boolean) => void;
  onClose: () => void;
  onSubmit: () => void;
};

const fields: Array<[keyof FormData, string, boolean?]> = [
  ['clientName', 'Nome *'],
  ['clientDocument', 'CPF'],
  ['clientRg', 'RG'],
  ['clientPhone', 'Telefone'],
  ['clientAddress', 'Endereco'],
  ['description', 'Descricao do Servico'],
  ['pricePerAdult', 'Valor por Adulto'],
  ['adultsCount', 'Numero de Adultos'],
  ['pricePerChild', 'Valor por Crianca'],
  ['childrenCount', 'Numero de Criancas'],
  ['additionalServices', 'Servicos Adicionais', true],
  ['value', 'Valor Total'],
  ['minGuests', 'Minimo de Convidados'],
  ['paymentObservation', 'Observacao de Pagamento', true],
  ['serviceType', 'Sistema de Servico'],
  ['drinksDescription', 'Servico de Bebidas'],
  ['cancellationDays', 'Dias sem Multa'],
  ['pizzaTeam', 'Equipe Pizza'],
  ['drinksTeam', 'Equipe Bebidas'],
  ['serviceObservation', 'Observacao do Servico', true],
  ['noticeHours', 'Antecedencia do Lembrete'],
  ['lateFeePercent', 'Multa por Atraso (%)'],
  ['lateFeeHours', 'Horas ate a Multa'],
];

function normalize(field: keyof FormData, value: string) {
  if (field === 'clientDocument') return maskCpf(value);
  if (field === 'clientRg') return maskRg(value);
  if (field === 'clientPhone') return maskPhone(value);
  if (['pricePerAdult', 'pricePerChild', 'value'].includes(field)) return maskCurrency(value);
  return value;
}

export default function ContractFormModal({ form, editing, events, onChange, onClose, onSubmit }: Props) {
  const change = (field: keyof FormData, value: string) => onChange(field, normalize(field, value));
  return (
    <Modal title={editing ? 'Editar Contrato' : 'Novo Contrato'} onClose={onClose} closeOnOverlay maxWidth={560} flush>
      <div className={styles.modalBody}>
        <div className={styles.formSectionLabel}>Contratante e evento</div>
        <div className={styles.formGrid2}>
          <div className={styles.formGroup}>
            <Select
              label="Evento Vinculado"
              value={form.eventId}
              onChange={(event) => onChange('eventId', event.target.value)}
            >
              <option value="">Nenhum</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </Select>
          </div>
          <div className={styles.formGroup}>
            <Input
              label="Data do Contrato"
              type="date"
              value={form.startDate}
              onChange={(event) => onChange('startDate', event.target.value)}
            />
          </div>
          {fields.slice(0, 6).map(([field, label, multiline]) => (
            <div key={field} className={styles.formGroup}>
              <Label className={styles.label}>{label}</Label>
              {multiline ? (
                <Textarea
                  className={styles.input}
                  rows={2}
                  value={String(form[field])}
                  onChange={(event) => change(field, event.target.value)}
                />
              ) : (
                <Input
                  className={styles.input}
                  value={String(form[field])}
                  onChange={(event) => change(field, event.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className={styles.formSectionLabel}>Precificacao e servico</div>
        <div className={styles.formGrid2}>
          {fields.slice(6).map(([field, label, multiline]) => (
            <div key={field} className={styles.formGroup}>
              <Label className={styles.label}>{label}</Label>
              {multiline ? (
                <Textarea
                  className={styles.input}
                  rows={2}
                  value={String(form[field])}
                  onChange={(event) => change(field, event.target.value)}
                />
              ) : (
                <Input
                  className={styles.input}
                  value={String(form[field])}
                  onChange={(event) => change(field, event.target.value)}
                />
              )}
            </div>
          ))}
          <div className={styles.formGroup}>
            <Select
              label="Cardapio do Evento"
              value={form.menuId}
              onChange={(event) => onChange('menuId', event.target.value)}
            >
              <option value="">Cardapio Padrao</option>
              {SOUL540_MENUS.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.name}
                </option>
              ))}
            </Select>
          </div>
          <Checkbox
            className={styles.label}
            label="Ja foi pago?"
            checked={form.paid}
            onChange={(event) => onChange('paid', event.target.checked)}
          />
        </div>
      </div>
      <div className={styles.modalFooter}>
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onSubmit} disabled={!form.clientName}>
          {editing ? 'Salvar' : 'Criar Contrato'}
        </Button>
      </div>
    </Modal>
  );
}
