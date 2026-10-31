type StyleMap = Record<string, string>;

export default function AccountInfoModal({ onClose, styles }: { onClose: () => void; styles: StyleMap }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <section className={styles.modal} onClick={(event) => event.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Sobre esta página</h2>
          <button className={styles.modalClose} onClick={onClose}>
            ×
          </button>
        </header>
        <div className={styles.modalBody}>
          <section className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Minha conta</p>
            <p className={styles.infoText}>Gerencie suas informações pessoais e preferências do sistema.</p>
          </section>
          <section className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Segurança</p>
            <p className={styles.infoText}>Informe uma nova senha e confirme a alteração.</p>
          </section>
          <section className={styles.infoSection}>
            <p className={styles.infoSectionTitle}>Aparência</p>
            <p className={styles.infoText}>Alterne entre o tema escuro e claro.</p>
          </section>
        </div>
      </section>
    </div>
  );
}
