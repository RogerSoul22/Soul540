import { Button, Heading, InfoButton, Input, Label, PageHeader, ThemeSwitch } from '../../../pentagono/src/index';
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
      <PageHeader
        className={styles.header}
        title="Minha conta"
        subtitle="Gerencie seu perfil"
        titleExtra={<InfoButton onClick={() => setShowInfo(true)} />}
      />
      <section className={styles.profileCard}>
        <div className={styles.profileAvatar}>{user?.name?.charAt(0) ?? 'F'}</div>
        <div className={styles.profileInfo}>
          <Heading level={2} variant="section" className={styles.profileName}>
            {user?.name}
          </Heading>
          <p className={styles.profileRole}>{user?.isAdmin ? 'Administrador' : 'Colaborador'}</p>
          <p className={styles.profileEmail}>{user?.email}</p>
        </div>
      </section>
      {saved ? <div className={styles.toast}>Salvo com sucesso!</div> : null}
      <form className={styles.form} onSubmit={saveProfile}>
        <section className={styles.formSection}>
          <Heading level={3} variant="section" className={styles.formSectionTitle}>
            Dados pessoais
          </Heading>
          <div className={styles.formGrid}>
            <Field label="Nome completo" styles={styles}>
              <Input className={styles.formInput} onChange={(event) => setName(event.target.value)} value={name} />
            </Field>
            <Field label="Telefone" styles={styles}>
              <Input className={styles.formInput} onChange={(event) => setPhone(event.target.value)} value={phone} />
            </Field>
            <Field full label="Endereço" styles={styles}>
              <Input
                className={styles.formInput}
                onChange={(event) => setAddress(event.target.value)}
                value={address}
              />
            </Field>
          </div>
        </section>
        <div className={styles.formActions}>
          <Button variant="primary" type="submit">
            Salvar alterações
          </Button>
        </div>
      </form>
      <AccountSecuritySection apiFetch={apiFetch} styles={styles} userId={user?.id} />
      <section className={styles.formSection}>
        <Heading level={3} variant="section" className={styles.formSectionTitle}>
          Aparência
        </Heading>
        <div className={styles.settingRow}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Modo claro</span>
            <span className={styles.settingDesc}>Alterna entre tema escuro e claro</span>
          </div>
          <ThemeSwitch isDark={isDark} onToggle={toggleTheme} />
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
    <Label className={`${styles.formField} ${full ? styles.formFieldFull : ''}`}>
      <span className={styles.formLabel}>{label}</span>
      {children}
    </Label>
  );
}
