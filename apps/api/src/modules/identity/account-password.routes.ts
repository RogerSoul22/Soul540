import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logAudit } from '../../infrastructure/audit-log';
import { decryptPassword, encryptPassword } from '../../infrastructure/security/password-vault';
import { UserModel } from './auth.routes';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual.'),
  newPassword: z.string().min(6, 'A nova senha precisa ter no mínimo 6 caracteres.').max(200),
});

interface Dependencies {
  findUser: (id: string) => Promise<{ passwordHash?: string; name?: string } | null>;
  savePasswordHash: (id: string, passwordHash: string, newPassword: string) => Promise<void>;
  findVault: (id: string) => Promise<string | null>;
  audit: (req: any, userName: string, description: string) => Promise<void>;
}

const defaults: Dependencies = {
  findUser: (id) => UserModel.findOne({ _id: id, deletedAt: { $exists: false } }).lean() as any,
  savePasswordHash: async (id, passwordHash, newPassword) => {
    await UserModel.updateOne({ _id: id }, { passwordHash, passwordVault: encryptPassword(newPassword) });
  },
  findVault: async (id) => {
    const user = (await UserModel.findOne({ _id: id, deletedAt: { $exists: false } })
      .select('+passwordVault')
      .lean()) as { passwordVault?: string } | null;
    return user?.passwordVault ?? null;
  },
  audit: async (req, userName, description) =>
    logAudit({
      req,
      action: 'update',
      resource: 'users',
      resourceId: String(req.user?._id),
      description: `${description}: ${userName}`,
    }),
};

// POST /api/account/password: o usuário troca a própria senha informando a atual. A senha de outro usuário
// (administrador redefinindo a de alguém) continua em PUT /api/users/:id.
export function createAccountPasswordRouter(dependencies: Dependencies = defaults) {
  const router = Router();

  router.post('/password', async (req: any, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0].message });

    const userId = String(req.user?._id ?? '');
    const user = userId ? await dependencies.findUser(userId) : null;
    if (!user?.passwordHash) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // 400 (e não 401): senha atual errada não pode derrubar a sessão da pessoa.
    if (!(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
      return res.status(400).json({ error: 'A senha atual está incorreta.' });
    }
    if (parsed.data.currentPassword === parsed.data.newPassword) {
      return res.status(400).json({ error: 'A nova senha precisa ser diferente da atual.' });
    }

    await dependencies.savePasswordHash(
      userId,
      await bcrypt.hash(parsed.data.newPassword, 10),
      parsed.data.newPassword,
    );
    await dependencies.audit(req, user.name ?? '', 'Alterou a própria senha');
    return res.json({ ok: true });
  });

  // POST /api/account/password/reveal: devolve a senha do PRÓPRIO usuário logado (nunca a de outra pessoa).
  // É POST e sem cache de propósito: a resposta não pode ficar guardada no navegador nem no modo offline.
  router.post('/password/reveal', async (req: any, res) => {
    const userId = String(req.user?._id ?? '');
    const user = userId ? await dependencies.findUser(userId) : null;
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    res.setHeader('Cache-Control', 'no-store');
    const password = decryptPassword(await dependencies.findVault(userId));
    if (password) await dependencies.audit(req, user.name ?? '', 'Visualizou a própria senha');
    // null = ainda não guardada (conta antiga): aparece depois do próximo login.
    return res.json({ password });
  });

  return router;
}

export default createAccountPasswordRouter();
