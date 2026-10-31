import { SOUL540_MENUS } from '../../../data/soul540Menus/index';
import { maskCpf, maskCurrency, maskPhone, maskRg } from '@soul540/screens';
import type { ContractEvents, FormData } from '../types/contract-types';
import styles from '../styles/Contratos.module.scss';
import ContractDynamicFields from './ContractDynamicFields';
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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{editing ? 'Editar Contrato' : 'Novo Contrato'}</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Fechar">
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formSectionLabel}>Contratante e evento</div>
          <div className={styles.formGrid2}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Evento Vinculado</label>
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
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Data do Contrato</label>
              <input
                className={styles.input}
                type="date"
                value={form.startDate}
                onChange={(event) => onChange('startDate', event.target.value)}
              />
            </div>
            <ContractDynamicFields fields={fields.slice(0, 6)} form={form} onChange={change} />
          </div>
          <div className={styles.formSectionLabel}>Precificacao e servico</div>
          <div className={styles.formGrid2}>
            <ContractDynamicFields fields={fields.slice(6)} form={form} onChange={change} />
            <div className={styles.formGroup}>
              <label className={styles.label}>Cardapio do Evento</label>
              <select
                className={styles.input}
                value={form.menuId}
                onChange={(event) => onChange('menuId', event.target.value)}
              >
                <option value="">Cardapio Padrao</option>
                {SOUL540_MENUS.map((menu) => (
                  <option key={menu.id} value={menu.id}>
                    {menu.name}
                  </option>
                ))}
              </select>
            </div>
            <label className={styles.label}>
              <input
                type="checkbox"
                checked={form.paid}
                onChange={(event) => onChange('paid', event.target.checked)}
              />{' '}
              Ja foi pago?
            </label>
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles.btnPrimary} onClick={onSubmit} disabled={!form.clientName}>
            {editing ? 'Salvar' : 'Criar Contrato'}
          </button>
        </div>
      </div>
    </div>
  );
}
