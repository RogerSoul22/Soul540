import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@frontend/hooks/useAuth';
import { ROUTES } from '@frontend/routes';
import Button from '@frontend/components/Button/Button';
import Input from '@frontend/components/Input/Input';
import styles from './Login.module.scss';

type Mode = 'login' | 'forgot' | 'forgot-sent';

export default function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

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

  const handleForgot = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro ao enviar email');
      } else {
        setMode('forgot-sent');
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.branding}>
        <div className={styles.brandingContent}>
          <img src="/logo.jpeg" alt="Soul540" className={styles.brandingLogo} />
        </div>
      </div>

      <div className={styles.formSide}>
        <div className={styles.formContainer}>
          <div className={styles.formLogo}>
            <img src="/logo.jpeg" alt="Soul540" className={styles.formLogoImg} />
          </div>

          {mode === 'login' && (
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
                <div>
                  <Input
                    label="Senha"
                    type="password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <div className={styles.forgotPassword}>
                    <button type="button" className={styles.forgotLink} onClick={() => { setMode('forgot'); setError(''); }}>
                      Esqueceu a senha?
                    </button>
                  </div>
                </div>
              </div>
              {error && <div className={styles.errorMessage}>{error}</div>}
              <div className={styles.formActions}>
                <Button type="submit" fullWidth loading={loading}>
                  Entrar
                </Button>
              </div>
            </form>
          )}

          {mode === 'forgot' && (
            <form className={styles.form} onSubmit={handleForgot}>
              <div className={styles.forgotTitle}>Recuperar Senha</div>
              <div className={styles.forgotDesc}>
                Informe seu email cadastrado. Se o envio de email estiver configurado, você receberá um link para redefinir sua senha.
              </div>
              <div className={styles.formFields}>
                <Input
                  label="Email"
                  type="email"
                  placeholder="seu@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              {error && <div className={styles.errorMessage}>{error}</div>}
              <div className={styles.formActions}>
                <Button type="submit" fullWidth loading={forgotLoading}>
                  Enviar link de recuperação
                </Button>
                <button type="button" className={styles.forgotLink} onClick={() => { setMode('login'); setError(''); }}>
                  Voltar ao login
                </button>
              </div>
            </form>
          )}

          {mode === 'forgot-sent' && (
            <div className={styles.form}>
              <div className={styles.forgotTitle}>Email Enviado</div>
              <div className={styles.forgotDesc}>
                Se o email <strong>{forgotEmail}</strong> estiver cadastrado, você receberá um link de recuperação em breve. Verifique sua caixa de entrada.
              </div>
              <div className={styles.formActions}>
                <button type="button" className={styles.forgotLink} onClick={() => { setMode('login'); setForgotEmail(''); }}>
                  Voltar ao login
                </button>
              </div>
            </div>
          )}

          <div className={styles.footer}>
            <p className={styles.footerText}>© 2025 Soul540 — Gestão de Eventos</p>
          </div>
        </div>
      </div>
    </div>
  );
}
