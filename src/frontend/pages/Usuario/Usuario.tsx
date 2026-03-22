import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@frontend/hooks/useAuth';
import { useTheme } from '@frontend/contexts/ThemeContext';
import Button from '@frontend/components/Button/Button';
import styles from './Usuario.module.scss';

export default function Usuario() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Profile form
  const [name, setName] = useState(user?.name || 'Administrador');
  const [phone, setPhone] = useState('(11) 99999-0000');
  const [address, setAddress] = useState('Rua das Pizzas, 540 - Sao Paulo, SP');
  const [saved, setSaved] = useState(false);

  const [passwordPlain, setPasswordPlain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then(r => r.json())
      .then((users: any[]) => {
        const me = users.find((u: any) => u.id === (user as any)?.id || u._id === (user as any)?.id);
        if (me?.passwordPlain) setPasswordPlain(me.passwordPlain);
      })
      .catch(() => {});
  }, [user]);

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) return;
    setChangingPassword(true);
    try {
      await fetch(`/api/users/${(user as any)?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });
      setPasswordPlain(newPassword);
      setNewPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 2000);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Minha Conta</h1>
          <p className={styles.subtitle}>Gerencie seu perfil</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>
          {user?.name?.charAt(0) || 'A'}
        </div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{user?.name || 'Administrador'}</h2>
          <p className={styles.profileRole}>{user?.role === 'admin' ? 'Administrador' : user?.role === 'manager' ? 'Gerente' : 'Equipe'}</p>
          <p className={styles.profileEmail}>{user?.email || 'admin@soul540.com'}</p>
        </div>
        <div className={styles.profileStats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>5</span>
            <span className={styles.statLabel}>Eventos</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>7</span>
            <span className={styles.statLabel}>Tarefas</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>2</span>
            <span className={styles.statLabel}>Notas</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {(saved || passwordSaved) && (
        <div className={styles.toast}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Salvo com sucesso!
        </div>
      )}

      <div className={styles.tabContent}>
        <form className={styles.form} onSubmit={handleSaveProfile}>
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Dados Pessoais</h3>
            <div className={styles.formGrid}>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Nome Completo</label>
                <input className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Telefone</label>
                <input className={styles.formInput} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className={`${styles.formField} ${styles.formFieldFull}`}>
                <label className={styles.formLabel}>Endereco</label>
                <input className={styles.formInput} value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Segurança</h3>
            <div className={styles.passwordRow}>
              <div className={styles.formField} style={{ flex: 1 }}>
                <label className={styles.formLabel}>Senha Atual</label>
                <div className={styles.passwordInputWrap}>
                  <input
                    className={styles.formInput}
                    type={showPassword ? 'text' : 'password'}
                    value={passwordPlain || ''}
                    readOnly
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPassword(v => !v)}>
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            <div className={styles.passwordRow} style={{ marginTop: 12 }}>
              <div className={styles.formField} style={{ flex: 1 }}>
                <label className={styles.formLabel}>Nova Senha</label>
                <div className={styles.passwordInputWrap}>
                  <input
                    className={styles.formInput}
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowNewPassword(v => !v)}>
                    {showNewPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="button"
                className={styles.btnChangePassword}
                onClick={handleChangePassword}
                disabled={changingPassword || newPassword.length < 6}
              >
                {changingPassword ? 'Salvando...' : 'Alterar Senha'}
              </button>
            </div>
          </div>

          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>Aparencia</h3>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Modo Escuro</span>
                <span className={styles.settingDesc}>Tema escuro para o sistema</span>
              </div>
              <label className={styles.toggle}>
                <input type="checkbox" checked={isDark} onChange={toggleTheme} />
                <span className={styles.toggleSlider} />
              </label>
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
