import type { ReactNode } from 'react';

// fullscreen: tela cheia com barra de ferramentas e área rolável (contrato, documento em papel);
// panel: painel escuro centralizado sobre fundo desfocado (visualização de cardápio).
export type DocumentViewerVariant = 'fullscreen' | 'panel';

export interface DocumentViewerProps {
  children: ReactNode;
  label: string;
  variant?: DocumentViewerVariant;
  // Barra fixa no topo (fullscreen).
  toolbar?: ReactNode;
  // Botões flutuantes no canto do painel (panel).
  actions?: ReactNode;
  closeOnOverlay?: boolean;
  className?: string;
  onClose: () => void;
}
