import styles from './Heading.module.css';
import type { HeadingProps } from './type';

export function Heading({ children, level = 1, variant = 'page', className = '', ...rest }: HeadingProps) {
  const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  return (
    <Tag className={`${styles.heading} ${styles[variant]} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
