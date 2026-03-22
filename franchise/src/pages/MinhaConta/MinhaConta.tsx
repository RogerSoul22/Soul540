import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { apiFetch } from '@/lib/api';
import styles from './MinhaConta.module.scss';

export default function MinhaConta() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const [passwordPlain, setPasswordPlain] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  useEffect(() => {
    apiFetch('/api/users')
      .then(r => r.json())
      .then((users: any[]) => {
        const me = users.find(u => u.id === (user as any)?.id || u._id === (user as any)?.id);
        if (me?.passwordPlain) setPasswordPlain(me.passwordPlain);
      })
      .catch(() => {});
  }, [user]);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!newPassword.trim() || newPassword.length < 6) return;
    setChangingPassword(true);
    try {
      await apiFetch(`/api/users/${(user as any)?.id}`, {
        method: 'PUT',
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

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Minha Conta</h1>
          <button className={styles.btnInfo} onClick={() => setShowInfo(true)} title="Informações">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </button>
        </div>
        <p className={styles.subtitle}>Gerencie seu perfil</p>
      </div>

      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>{user?.name?.charAt(0) || 'F'}</div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{user?.name}</h2>
          <p className={styles.profileRole}>{user?.isAdmin ? 'Administrador' : 'Franqueado'}</p>
          <p className={styles.profileEmail}>{user?.email}</p>
        </div>
      </div>

      {(saved || passwordSaved) && (
        <div className={styles.toast}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          Salvo com sucesso!
        </div>
      )}

      <form className={styles.form} onSubmit={handleSave}>
        <div className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Dados Pessoais</h3>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Nome Completo</label>
              <input className={styles.formInput} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className={styles.formField}>
              <label className={styles.formLabel}>Telefone</label>
              <input className={styles.formInput} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-0000" />
            </div>
            <div className={`${styles.formField} ${styles.formFieldFull}`}>
              <label className={styles.formLabel}>Endereço</label>
              <input className={styles.formInput} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Rua, número, bairro, cidade" />
            </div>
          </div>
        </div>

        <div className={styles.formActions}>
          <button type="submit" className={styles.btnSave}>Salvar Alterações</button>
        </div>
      </form>

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
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
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
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowNewPassword(v => !v)}
              >
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
        <h3 className={styles.formSectionTitle}>Aparência</h3>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Modo Claro</span>
            <span className={styles.settingDesc}>Alterna entre tema escuro e claro</span>
          </div>
          <label className={styles.toggle}>
            <input type="checkbox" checked={!isDark} onChange={toggleTheme} />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>

      {showInfo && (
        <div className={styles.overlay} onClick={() => setShowInfo(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Sobre esta página</h2>
              <button className={styles.modalClose} onClick={() => setShowInfo(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Minha Conta</p>
                <p className={styles.infoText}>Gerencie suas informações pessoais e preferências do sistema.</p>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Segurança</p>
                <ul className={styles.infoList}>
                  <li>Visualize sua senha atual clicando no ícone de olho</li>
                  <li>Para alterar a senha, digite a nova senha e clique em "Alterar Senha"</li>
                </ul>
              </div>
              <div className={styles.infoSection}>
                <p className={styles.infoSectionTitle}>Aparência</p>
                <ul className={styles.infoList}>
                  <li>Alterne entre o tema escuro e o tema claro</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
