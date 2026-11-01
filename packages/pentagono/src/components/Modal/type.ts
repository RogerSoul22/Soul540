import type { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalProps {
  children: ReactNode;
  title: ReactNode;
  size?: ModalSize;
  // Largura máxima própria (px ou CSS) para modais que não cabem nos tamanhos padrão.
  maxWidth?: number | string;
  subtitle?: ReactNode;
  // Botões extras no cabeçalho, antes do botão de fechar.
  headerActions?: ReactNode;
  // Corpo sem padding próprio: o conteúdo traz o espaçamento (corpo e rodapé da página).
  flush?: boolean;
  closeOnOverlay?: boolean;
  className?: string;
  onClose: () => void;
}
