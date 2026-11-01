import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../routes';
import { Button, Input } from '../../../../../packages/pentagono/src/index';
import styles from './styles/Login.module.scss';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
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
          <img src="/logo.png" alt="Soul540" className={styles.brandingLogo} />
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formLogo}>
            <img src="/logo.png" alt="Soul540" className={styles.formLogoImg} />
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formFields}>
              <Input
                label="Email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <Input
                label="Senha"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error && <div className={styles.errorMessage}>{error}</div>}
            <div className={styles.formActions}>
              <Button type="submit" fullWidth loading={loading}>
                Entrar
              </Button>
            </div>
          </form>

          <div className={styles.footer}>
            <p className={styles.footerText}>© 2025 Soul540 — Gestão de Eventos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
