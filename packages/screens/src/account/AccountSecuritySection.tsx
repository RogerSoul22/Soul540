import { Button, Heading, Input, Label } from '../../../pentagono/src/index';
import { useEffect, useState } from 'react';

type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;
type StyleMap = Record<string, string>;

interface AccountSecuritySectionProps {
  apiFetch: ApiFetch;
  styles: StyleMap;
  userId?: string;
}

export default function AccountSecuritySection({ apiFetch, styles, userId }: AccountSecuritySectionProps) {
  // Senha atual guardada (criptografada) no servidor; null = ainda não guardada (conta antiga).
  const [stored, setStored] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const currentPassword = stored ?? typed;
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    apiFetch('/api/account/password/reveal', { method: 'POST', headers: { 'X-Silent-Errors': '1' } })
      .then((response) => response.json())
      .then((data) => active && setStored(data.password ?? null))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  async function savePassword() {
    if (!currentPassword || password.length < 6 || !userId) return;
    setSaving(true);
    try {
      // A senha atual é conferida no servidor antes de aceitar a nova.
      await apiFetch('/api/account/password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword: password }),
      });
      setStored(password);
      setTyped('');
      setPassword('');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.formSection}>
      <Heading level={3} variant="section" className={styles.formSectionTitle}>
        Segurança
      </Heading>
      {saved ? <div className={styles.toast}>Senha alterada com sucesso!</div> : null}
      <div className={styles.passwordRow}>
        <div className={styles.formField} style={{ flex: 1 }}>
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            readOnly={stored !== null}
            clearable={stored === null}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="Digite a sua senha atual"
          />
          {stored === null && (
            <p className={styles.settingDesc}>
              Sua senha atual aparece aqui depois do seu próximo login. Até lá, digite-a para poder alterá-la.
            </p>
          )}
        </div>
      </div>
      <div className={styles.passwordRow} style={{ marginTop: 12 }}>
        <Label className={styles.formField} style={{ flex: 1 }}>
          <span className={styles.formLabel}>Nova senha</span>
          <div className={styles.passwordInputWrap}>
            <Input
              className={styles.formInput}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
              type={showPassword ? 'text' : 'password'}
              value={password}
            />
            <Button
              variant="outline"
              className={styles.eyeBtn}
              onClick={() => setShowPassword((visible) => !visible)}
              type="button"
            >
              {showPassword ? 'Ocultar' : 'Ver'}
            </Button>
          </div>
        </Label>
        <Button
          variant="outline"
          className={styles.btnChangePassword}
          disabled={saving || !currentPassword || password.length < 6}
          onClick={savePassword}
          type="button"
        >
          {saving ? 'Salvando...' : 'Alterar senha'}
        </Button>
      </div>
    </section>
  );
}
