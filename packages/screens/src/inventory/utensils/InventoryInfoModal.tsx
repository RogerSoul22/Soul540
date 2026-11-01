import { Button } from '../../../../pentagono/src/index';
import InventoryModalFrame from './InventoryModalFrame';
import frameStyles from './styles/InventoryModalFrame.module.scss';
import styles from './styles/InventoryInfoModal.module.scss';

export default function InventoryInfoModal({ onClose, open }: { onClose: () => void; open: boolean }) {
  if (!open) return null;

  return (
    <InventoryModalFrame
      footer={
        <>
          <span />
          <Button variant="primary" onClick={onClose}>
            Entendido
          </Button>
        </>
      }
      onClose={onClose}
      title="Sobre esta página"
    >
      <InfoSection title="O que é esta página?">
        A página de <strong>Estoque de Utensílios</strong> permite controlar todos os equipamentos, ferramentas e
        utensílios do seu negócio. Acompanhe disponibilidade, localização e valor de cada item.
      </InfoSection>
      <InfoSection title="Como cadastrar um utensílio">
        <ol className={styles.list}>
          <li>
            Clique em <strong>Novo Utensílio</strong> no canto superior direito.
          </li>
          <li>Preencha nome, categoria, quantidade, valor unitário e localização.</li>
          <li>Selecione o status: Disponível, Em Uso, Manutenção ou Descartado.</li>
          <li>
            Clique em <strong>Cadastrar Utensílio</strong> para salvar.
          </li>
        </ol>
      </InfoSection>
      <InfoSection title="Como usar as categorias">
        <ol className={styles.list}>
          <li>
            Na seção <strong>Categorias</strong>, clique em <strong>Nova Categoria</strong>.
          </li>
          <li>
            Digite o nome e clique em <strong>Adicionar</strong>.
          </li>
          <li>Clique em uma categoria para filtrar os utensílios por ela.</li>
        </ol>
      </InfoSection>
      <InfoSection title="Ver detalhes de um item">
        Clique em qualquer card para abrir todos os detalhes do utensílio, incluindo valor total e data de cadastro.
      </InfoSection>
    </InventoryModalFrame>
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
