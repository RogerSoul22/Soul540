import { type FormEvent, type ReactNode, useState } from 'react';

export interface UnitLoginFeature {
  icon: ReactNode;
  text: string;
}

export interface UnitLoginStyles {
  [className: string]: string;
}

interface UnitLoginScreenProps {
  description: string;
  features: UnitLoginFeature[];
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  onSuccess(): void;
  styles: UnitLoginStyles;
  unitName: string;
}

export default function UnitLoginScreen({
  description,
  features,
  loading,
  login,
  onSuccess,
  styles,
  unitName,
}: UnitLoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      await login(email, password);
      onSuccess();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Erro ao fazer login');
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.branding}>
        <div className={styles.brandingContent}>
          <img src="/logo.png" alt="Soul540" className={styles.brandingLogo} />
          <h1 className={styles.brandingTitle}>
            Soul<span className={styles.brandingHighlight}>540</span>
            <br />
            {unitName}
          </h1>
          <p className={styles.brandingDescription}>{description}</p>
          <div className={styles.brandingFeatures}>
            {features.map((feature) => (
              <div key={feature.text} className={styles.feature}>
                <div className={styles.featureIcon}>{feature.icon}</div>
                <span className={styles.featureText}>{feature.text}</span>
              </div>
            ))}
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
                <label htmlFor="unit-login-email">Email</label>
                <input
                  id="unit-login-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="unit-login-password">Senha</label>
                <input
                  id="unit-login-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  required
                />
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
