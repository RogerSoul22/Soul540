import type { ReactNode } from 'react';
import { VisuallyHidden } from '../../accessibility/VisuallyHidden';

export interface SkeletonValueProps {
  loading: boolean;
  label: string;
  as?: 'span' | 'p' | 'strong' | 'h2';
  className?: string;
  children?: ReactNode;
}

export function SkeletonValue({ loading, label, as: Element = 'span', className, children }: SkeletonValueProps) {
  return (
    <>
      {loading && (
        <span role="status" aria-live="polite">
          <VisuallyHidden>{label}</VisuallyHidden>
        </span>
      )}
      <Element className={className} data-skeleton={loading} aria-hidden={loading}>
        {children}
      </Element>
    </>
  );
}
