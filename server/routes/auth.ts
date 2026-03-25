import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  passwordPlain: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false },
  permissions: { type: [String], default: [] },
  unit: { type: String, enum: ['main', 'franchise', 'factory'], default: 'main' },
}, { toJSON: { virtuals: true, versionKey: false } });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email e senha obrigatorios' });

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Email ou senha incorretos' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Email ou senha incorretos' });

  const userUnit = (user as any).unit || 'main';
  const xSystem = (req.headers['x-system'] as string) || 'main';

  // Admins can log in to any system; other users only to their own system
  if (!user.isAdmin && userUnit !== xSystem) {
    return res.status(403).json({ error: 'Acesso não permitido neste sistema' });
  }

  const token = jwt.sign(
    { userId: user._id.toString(), unit: userUnit, role: (user as any).role },
    process.env.JWT_SECRET || 'soul540-secret',
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, permissions: user.permissions, unit: userUnit } });
});

export default router;
