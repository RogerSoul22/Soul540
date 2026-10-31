import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validate } from '../../infrastructure/middleware/validate';
import { loginSchema } from '../../infrastructure/schemas/auth';
import { getJwtSecret } from '../../infrastructure/security/jwt-secret';
import { canAccessSystem, normalizeSystem } from './auth-system-policy';

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    permissions: { type: [String], default: [] },
    unit: { type: String, enum: ['main', 'franchise', 'factory'], default: 'main' },
    franchiseId: { type: Schema.Types.ObjectId, ref: 'Franchise' },
    deletedAt: { type: Date, index: true },
  },
  { toJSON: { virtuals: true, versionKey: false } },
);

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email e senha obrigatorios' });

  const user = await UserModel.findOne({ email: email.toLowerCase(), deletedAt: { $exists: false } });
  if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Email ou senha incorretos' });

  const userUnit = (user as any).unit || 'main';
  const xSystem = normalizeSystem(req.headers['x-system']);

  if (!canAccessSystem(user, xSystem)) {
    return res.status(403).json({ error: 'Acesso não permitido neste sistema' });
  }

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      unit: userUnit,
      franchiseId: (user as any).franchiseId?.toString(),
      role: (user as any).role,
    },
    getJwtSecret(),
    { expiresIn: '7d' },
  );
  res.cookie('soul540_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      permissions: user.permissions,
      unit: userUnit,
      franchiseId: (user as any).franchiseId?.toString(),
    },
  });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = (req as any).cookies?.soul540_token;
  if (!token) return res.status(401).json({ error: 'not authenticated' });
  try {
    const payload = jwt.verify(token, getJwtSecret()) as any;
    const user = (await UserModel.findOne({ _id: payload.userId, deletedAt: { $exists: false } })
      .select('-passwordHash -passwordPlain')
      .lean()) as any;
    if (!user) return res.status(401).json({ error: 'user not found' });
    if (!canAccessSystem(user, normalizeSystem(req.headers['x-system']))) {
      return res.status(403).json({ error: 'Acesso não permitido neste sistema' });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        permissions: user.permissions,
        unit: user.unit,
        franchiseId: user.franchiseId?.toString(),
      },
    });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('soul540_token', { httpOnly: true, sameSite: 'strict' });
  res.json({ ok: true });
});

export default router;
