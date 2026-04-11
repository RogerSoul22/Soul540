import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@frontend/routes';
import Button from '@frontend/components/Button/Button';
import Input from '@frontend/components/Input/Input';
import styles from './ResetPassword.module.scss';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.title}>Link inválido</div>
          <div className={styles.desc}>Este link de recuperação é inválido ou expirou.</div>
          <button className={styles.link} onClick={() => navigate(ROUTES.LOGIN)}>Voltar ao login</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) { setError('Senha deve ter pelo menos 6 caracteres'); return; }
    if (password !== confirm) { setError('As senhas não conferem'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erro ao redefinir senha'); return; }
      setDone(true);
    } catch {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.jpeg" alt="Soul540" className={styles.logoImg} />
        </div>

        {done ? (
          <>
            <div className={styles.title}>Senha redefinida!</div>
            <div className={styles.desc}>Sua senha foi atualizada com sucesso. Você já pode fazer login.</div>
            <Button fullWidth onClick={() => navigate(ROUTES.LOGIN)}>Ir para o login</Button>
          </>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.title}>Nova Senha</div>
            <div className={styles.desc}>Defina uma nova senha para sua conta.</div>
            <Input
              label="Nova senha"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Input
              label="Confirmar senha"
              type="password"
              placeholder="Repita a senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
            {error && <div className={styles.error}>{error}</div>}
            <Button type="submit" fullWidth loading={loading}>Redefinir senha</Button>
          </form>
        )}
      </div>
    </div>
  );
}
