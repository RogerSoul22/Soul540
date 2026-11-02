import type { ElementType, KeyboardEvent, MouseEvent, ReactNode } from 'react';

type Props = {
  eventId: string;
  eventName: string;
  onNavigate: (path: string) => void;
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

// Item de painel que abre o evento: a página de Eventos abre o detalhes do evento pelo parâmetro da URL.
export default function OpsEventLink({ eventId, eventName, onNavigate, as: Tag = 'div', className, children }: Props) {
  const open = () => onNavigate(`/eventos?view=${eventId}`);
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      open();
    }
  };

  return (
    <Tag
      className={className}
      role="link"
      tabIndex={0}
      aria-label={`Abrir evento ${eventName}`}
      onClick={(event: MouseEvent) => {
        event.stopPropagation();
        open();
      }}
      onKeyDown={onKeyDown}
    >
      {children}
    </Tag>
  );
}
