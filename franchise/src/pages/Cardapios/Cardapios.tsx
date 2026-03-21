import styles from './Cardapios.module.scss';

export default function Cardapios() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Cardápios</h1>
        <p className={styles.subtitle}>Cardápios disponíveis na sua unidade.</p>
      </div>
      <div className={styles.empty}>
        <p>Nenhum registro encontrado.</p>
      </div>
    </div>
  );
}
