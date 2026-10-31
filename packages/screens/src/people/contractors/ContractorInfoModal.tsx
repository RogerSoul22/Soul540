import ContractorModalFrame from './ContractorModalFrame';
import styles from './styles/ContractorModalFrame.module.scss';

export default function ContractorInfoModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <ContractorModalFrame
      footer={
        <span>
          <button className={styles.primaryButton} onClick={onClose}>
            Entendido
          </button>
        </span>
      }
      onClose={onClose}
      title="Sobre esta página"
      width="wide"
    >
      <InfoSection title="O que é esta página?">
        A página de <strong>Contratantes</strong> centraliza clientes e parceiros. Aqui você pode cadastrar, editar,
        visualizar e excluir contratantes, além de organizá-los por categorias.
      </InfoSection>
      <InfoSection title="Como criar um contratante">
        Clique em <strong>Novo Contratante</strong>, selecione o tipo de pessoa, informe os dados e confirme o cadastro.
      </InfoSection>
      <InfoSection title="Como criar uma categoria">
        Em <strong>Categorias</strong>, clique em <strong>Nova categoria</strong>. A categoria fica disponível no filtro
        e no formulário de contratante.
      </InfoSection>
    </ContractorModalFrame>
  );
}

function InfoSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className={styles.infoSection}>
      <strong>{title}</strong>
      <p>{children}</p>
    </section>
  );
}
