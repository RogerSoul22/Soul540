import { useState } from 'react';

type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;
type StyleMap = Record<string, string>;

interface AccountSecuritySectionProps {
  apiFetch: ApiFetch;
  styles: StyleMap;
  userId?: string;
}

export default function AccountSecuritySection({ apiFetch, styles, userId }: AccountSecuritySectionProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function savePassword() {
    if (password.length < 6 || !userId) return;
    setSaving(true);
    try {
      await apiFetch(`/api/users/${userId}`, { method: 'PUT', body: JSON.stringify({ password }) });
      setPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.formSection}>
      <h3 className={styles.formSectionTitle}>Segurança</h3>
      {saved ? <div className={styles.toast}>Senha alterada com sucesso!</div> : null}
      <div className={styles.passwordRow}>
        <label className={styles.formField} style={{ flex: 1 }}>
          <span className={styles.formLabel}>Nova senha</span>
          <div className={styles.passwordInputWrap}>
            <input
              className={styles.formInput}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <button className={styles.eyeBtn} onClick={() => setShowPassword((visible) => !visible)} type="button">
              {showPassword ? 'Ocultar' : 'Ver'}
            </button>
          </div>
        </label>
        <button
          className={styles.btnChangePassword}
          disabled={saving || password.length < 6}
          onClick={savePassword}
          type="button"
        >
          {saving ? 'Salvando...' : 'Alterar senha'}
        </button>
      </div>
    </section>
  );
}
