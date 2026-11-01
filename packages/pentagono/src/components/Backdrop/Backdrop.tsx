import styles from './Backdrop.module.css';
import type { BackdropProps } from './type';

// Camada invisível que fecha popovers (seletores de data, menus) ao clicar fora.
export function Backdrop({ onClick, className = '' }: BackdropProps) {
  return <div className={`${styles.backdrop} ${className}`.trim()} onClick={onClick} aria-hidden="true" />;
}
