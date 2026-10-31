import type { FormEvent } from 'react';
import { useState } from 'react';
import AccountInfoModal from './AccountInfoModal';
import AccountSecuritySection from './AccountSecuritySection';

type ApiFetch = (path: string, options?: RequestInit) => Promise<Response>;
type StyleMap = Record<string, string>;

interface AccountUser {
  id?: string;
  email?: string;
  isAdmin?: boolean;
  name?: string;
}
interface AccountScreenProps {
  apiFetch: ApiFetch;
  isDark: boolean;
  styles: StyleMap;
  toggleTheme: () => void;
  user?: AccountUser | null;
}

export default function AccountScreen({ apiFetch, isDark, styles, toggleTheme, user }: AccountScreenProps) {
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saved, setSaved] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Minha conta</h1>
          <button className={styles.btnInfo} onClick={() => setShowInfo(true)}>
            i
          </button>
        </div>
        <p className={styles.subtitle}>Gerencie seu perfil</p>
      </header>
      <section className={styles.profileCard}>
        <div className={styles.profileAvatar}>{user?.name?.charAt(0) ?? 'F'}</div>
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{user?.name}</h2>
          <p className={styles.profileRole}>{user?.isAdmin ? 'Administrador' : 'Colaborador'}</p>
          <p className={styles.profileEmail}>{user?.email}</p>
        </div>
      </section>
      {saved ? <div className={styles.toast}>Salvo com sucesso!</div> : null}
      <form className={styles.form} onSubmit={saveProfile}>
        <section className={styles.formSection}>
          <h3 className={styles.formSectionTitle}>Dados pessoais</h3>
          <div className={styles.formGrid}>
            <Field label="Nome completo" styles={styles}>
              <input className={styles.formInput} onChange={(event) => setName(event.target.value)} value={name} />
            </Field>
            <Field label="Telefone" styles={styles}>
              <input className={styles.formInput} onChange={(event) => setPhone(event.target.value)} value={phone} />
            </Field>
            <Field full label="Endereço" styles={styles}>
              <input
                className={styles.formInput}
                onChange={(event) => setAddress(event.target.value)}
                value={address}
              />
            </Field>
          </div>
        </section>
        <div className={styles.formActions}>
          <button className={styles.btnSave} type="submit">
            Salvar alterações
          </button>
        </div>
      </form>
      <AccountSecuritySection apiFetch={apiFetch} styles={styles} userId={user?.id} />
      <section className={styles.formSection}>
        <h3 className={styles.formSectionTitle}>Aparência</h3>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Modo claro</span>
            <span className={styles.settingDesc}>Alterna entre tema escuro e claro</span>
          </div>
          <label className={styles.toggle}>
            <input checked={!isDark} onChange={toggleTheme} type="checkbox" />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </section>
      {showInfo ? <AccountInfoModal onClose={() => setShowInfo(false)} styles={styles} /> : null}
    </main>
  );
}

function Field({
  children,
  full = false,
  label,
  styles,
}: {
  children: React.ReactNode;
  full?: boolean;
  label: string;
  styles: StyleMap;
}) {
  return (
    <label className={`${styles.formField} ${full ? styles.formFieldFull : ''}`}>
      <span className={styles.formLabel}>{label}</span>
      {children}
    </label>
  );
}
