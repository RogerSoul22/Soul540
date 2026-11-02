import { useEffect, useState } from 'react';
import { Button, Heading, Input } from '../../../../../packages/pentagono/src/index';
import { SILENT_ERRORS_HEADER, apiFetch } from '../../lib/api';
import styles from './styles/Usuario.module.scss';

// Troca de senha: a senha atual é conferida no servidor (POST /api/account/password) antes de aceitar a nova.
export default function UsuarioSecurity({ onSaved }: { onSaved: () => void }) {
  // Senha atual guardada (criptografada) no servidor; null = ainda não guardada (conta antiga).
  const [stored, setStored] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const currentPassword = stored ?? typed;
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    let active = true;
    apiFetch('/api/account/password/reveal', { method: 'POST', headers: { [SILENT_ERRORS_HEADER]: '1' } })
      .then((response) => response.json())
      .then((data) => active && setStored(data.password ?? null))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || newPassword.length < 6) return;
    setChangingPassword(true);
    setPasswordError('');
    try {
      // O erro aparece abaixo do campo, sem o aviso global.
      await apiFetch('/api/account/password', {
        method: 'POST',
        headers: { [SILENT_ERRORS_HEADER]: '1' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      setStored(newPassword);
      setTyped('');
      setNewPassword('');
      onSaved();
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Não foi possível alterar a senha.');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className={styles.formSection}>
      <Heading level={3} variant="section" className={styles.formSectionTitle}>
        Seguranca
      </Heading>
      <div className={styles.passwordRow}>
        <div className={styles.formField} style={{ flex: 1 }}>
          <Input
            label="Senha Atual"
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            readOnly={stored !== null}
            clearable={stored === null}
            onChange={(event) => setTyped(event.target.value)}
            placeholder="Digite a sua senha atual"
            error={passwordError}
          />
          {stored === null && (
            <p className={styles.settingDesc}>
              Sua senha atual aparece aqui depois do seu próximo login. Até lá, digite-a para poder alterá-la.
            </p>
          )}
        </div>
      </div>
      <div className={styles.passwordRow} style={{ marginTop: 12 }}>
        <div className={styles.formField} style={{ flex: 1 }}>
          <Input
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Minimo 6 caracteres"
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className={styles.btnChangePassword}
          onClick={handleChangePassword}
          disabled={changingPassword || !currentPassword || newPassword.length < 6}
        >
          {changingPassword ? 'Salvando...' : 'Alterar Senha'}
        </Button>
      </div>
    </div>
  );
}
