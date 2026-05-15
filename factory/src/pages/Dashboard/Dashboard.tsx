import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import styles from './Dashboard.module.scss';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.dateLabel}>{today}</p>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>{greeting}, {user?.name?.split(' ')[0]}</h1>
          <button
            className={styles.btnNewEntry}
            onClick={() => navigate('/financeiro?action=new&type=cost')}
            title="Lançar nova despesa"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Lançar Despesa
          </button>
        </div>
        <p className={styles.subtitle}>Bem-vindo ao sistema da fábrica.</p>
      </div>
      <div className={styles.cards}>
        {[
          { label: 'Eventos este mês', value: '—', color: 'amber' },
          { label: 'Funcionários', value: '—', color: 'blue' },
          { label: 'Receita mensal', value: '—', color: 'green' },
          { label: 'Estoque crítico', value: '—', color: 'red' },
        ].map(card => (
          <div key={card.label} className={`${styles.card} ${styles[card.color]}`}>
            <p className={styles.cardLabel}>{card.label}</p>
            <p className={styles.cardValue}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
