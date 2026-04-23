import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/routes';
import styles from './Login.module.scss';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate(ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.branding}>
        <div className={styles.brandingContent}>
          <img src="/logo.jpeg" alt="Soul540" className={styles.brandingLogo} />
          <h1 className={styles.brandingTitle}>
            Soul<span className={styles.brandingHighlight}>540</span>
            <br />Campinas
          </h1>
          <p className={styles.brandingDescription}>
            Gerencie sua unidade com controle total sobre eventos, equipe e finanças.
          </p>
          <div className={styles.brandingFeatures}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span className={styles.featureText}>Gestão de eventos e agendamentos</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span className={styles.featureText}>Controle de equipe e contratantes</span>
            </div>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
              <span className={styles.featureText}>Financeiro e relatórios em tempo real</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>Bem-vindo</h2>
            <p className={styles.formSubtitle}>Acesse sua conta para continuar</p>
          </div>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formFields}>
              <div className={styles.field}>
                <label>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
              </div>
              <div className={styles.field}>
                <label>Senha</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            </div>
            {error && <p className={styles.errorMessage}>{error}</p>}
            <div className={styles.formActions}>
              <button type="submit" className={styles.btn} disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </div>
          </form>
          <div className={styles.footer}>
            <p className={styles.footerText}>Soul540 © {new Date().getFullYear()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
