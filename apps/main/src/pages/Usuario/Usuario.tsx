import type { FormEvent } from 'react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../../../../packages/ui/src/index';
import { Button, Card, Heading, Input, PageHeader, ThemeSwitch } from '../../../../../packages/pentagono/src/index';
import UsuarioSecurity from './UsuarioSecurity';
import styles from './styles/Usuario.module.scss';

export default function Usuario() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [name, setName] = useState(user?.name || 'Administrador');
  const [phone, setPhone] = useState('(11) 99999-0000');
  const [address, setAddress] = useState('Rua das Pizzas, 540 - Sao Paulo, SP');
  const [saved, setSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const flash = (setter: (value: boolean) => void) => {
    setter(true);
    setTimeout(() => setter(false), 2000);
  };

  const handleSaveProfile = (event: FormEvent) => {
    event.preventDefault();
    flash(setSaved);
  };

  return (
    <div className={styles.page}>
      <PageHeader title="Minha Conta" subtitle="Gerencie seu perfil" />

      <Card className={styles.profileCard}>
        <div className={styles.profileAvatar}>{user?.name?.charAt(0) || 'A'}</div>
        <div className={styles.profileInfo}>
          <Heading level={2} variant="section" className={styles.profileName}>
            {user?.name || 'Administrador'}
          </Heading>
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
      </Card>

      {(saved || passwordSaved) && <div className={styles.toast}>Salvo com sucesso!</div>}

      <div className={styles.tabContent}>
        <form className={styles.form} onSubmit={handleSaveProfile}>
          <div className={styles.formSection}>
            <Heading level={3} variant="section" className={styles.formSectionTitle}>
              Dados Pessoais
            </Heading>
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

          <UsuarioSecurity onSaved={() => flash(setPasswordSaved)} />

          <div className={styles.formSection}>
            <Heading level={3} variant="section" className={styles.formSectionTitle}>
              Aparencia
            </Heading>
            <div className={styles.settingRow}>
              <div className={styles.settingInfo}>
                <span className={styles.settingLabel}>Modo Escuro</span>
                <span className={styles.settingDesc}>Tema escuro para o sistema</span>
              </div>
              <ThemeSwitch isDark={isDark} onToggle={toggleTheme} />
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
