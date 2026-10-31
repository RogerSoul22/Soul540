import EmployeeModalFrame from './EmployeeModalFrame';
import styles from './styles/EmployeeInfoModal.module.scss';

export default function EmployeeInfoModal({ onClose, open }: { onClose: () => void; open: boolean }) {
  if (!open) return null;

  return (
    <EmployeeModalFrame maxWidth={440} onClose={onClose} title="Sobre funcionários">
      <InfoSection title="O que é esta página?">
        Cadastre e gerencie toda a sua equipe — pizzaiolos, garçons, entregadores, gerentes e mais. Consulte informações
        de contato, documentos e disponibilidade de cada colaborador.
      </InfoSection>
      <InfoSection title="Como cadastrar um funcionário">
        <ol className={styles.list}>
          <li>
            Clique em <strong>Novo Funcionário</strong>.
          </li>
          <li>Preencha nome, cargo e telefone (WhatsApp).</li>
          <li>Adicione CPF, RG, endereço e chave Pix se desejar.</li>
          <li>
            Use o campo <strong>Observação</strong> para anotações internas.
          </li>
          <li>
            Selecione os <strong>dias disponíveis</strong> do colaborador.
          </li>
        </ol>
      </InfoSection>
      <InfoSection title="Dias disponíveis">
        O seletor de dias mostra quando o funcionário está disponível para trabalhar. Clique em cada dia para ativar ou
        desativar; os selecionados aparecem em verde no card.
      </InfoSection>
    </EmployeeModalFrame>
  );
}

function InfoSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className={styles.section}>
      <p className={styles.title}>{title}</p>
      <div className={styles.text}>{children}</div>
    </section>
  );
}
