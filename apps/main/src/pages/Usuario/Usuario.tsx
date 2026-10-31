import type { FormEvent } from 'react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiFetch } from '../../lib/api';
import { Button, Input, useTheme } from '../../../../../packages/ui/src/index';
import styles from './styles/Usuario.module.scss';

export default function Usuario() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || 'Administrador');
  const [phone, setPhone] = useState('(11) 99999-0000');
  const [address, setAddress] = useState('Rua das Pizzas, 540 - Sao Paulo, SP');
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const flash = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) return;
    setChangingPassword(true);
    try {
      await apiFetch(`/api/users/${(user as { id?: string } | null)?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      setNewPassword('');
      flash(setPasswordSaved);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = (event: FormEvent) => {
    event.preventDefault();
    flash(setSaved);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Minha Conta</h1>
          <p className={styles.subtitle}>Gerencie seu perfil</p>
        </div>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>{user?.name?.charAt(0) || 'A'}</div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{user?.name || 'Administrador'}</h2>
          <p className={styles.profileRole}>
            {user?.role === 'admin' ? 'Administrador' : user?.role === 'manager' ? 'Gerente' : 'Equipe'}
          </p>
          <p className={styles.profileEmail}>{user?.email || 'admin@soul540.com'}</p>
        </div>
        <div className={styles.profileStats}>
          {['Eventos|5', 'Tarefas|7', 'Notas|2'].map((stat) => {
            const [label, value] = stat.split('|');
            return (
              <div className={styles.stat} key={label}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {(saved || passwordSaved) && <div className={styles.toast}>Salvo com sucesso!</div>}

      <div className={styles.tabContent}>
        <form className={styles.form} onSubmit={handleSaveProfile}>
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Dados Pessoais</h3>
            <div className={styles.formGrid}>
              <Input
                label="Nome Completo"
                className={styles.formInput}
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Input
                label="Telefone"
                className={styles.formInput}
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
              <div className={styles.formFieldFull}>
                <Input
                  label="Endereco"
                  className={styles.formInput}
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Seguranca</h3>
            <div className={styles.passwordRow}>
              <div className={styles.formField} style={{ flex: 1 }}>
                <Input label="Senha Atual" type="password" value="********" readOnly />
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
                disabled={changingPassword || newPassword.length < 6}
              >
                {changingPassword ? 'Salvando...' : 'Alterar Senha'}
              </Button>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Aparencia</h3>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Modo Escuro</span>
                <span className={styles.settingDesc}>Tema escuro para o sistema</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                className={styles.toggle}
                aria-pressed={isDark}
                onClick={toggleTheme}
              >
                {isDark ? 'Ativado' : 'Desativado'}
              </Button>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button type="submit">Salvar Alteracoes</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
