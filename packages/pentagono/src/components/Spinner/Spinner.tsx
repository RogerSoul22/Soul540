import { VisuallyHidden } from '../../accessibility/VisuallyHidden';
import styles from './Spinner.module.css';
import type { SpinnerProps } from './type';

// Para ações do usuário (salvar, enviar) e transições. Dados da API usam SkeletonContent.
export function Spinner({ size = 32, label = 'Carregando...' }: SpinnerProps) {
  return (
    <span role="status" className={styles.wrap}>
      <span className={styles.spinner} style={{ width: size, height: size }} aria-hidden="true" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </span>
  );
}
