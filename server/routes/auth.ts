import { Router } from 'express';
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { validate } from '../middleware/validate';
import { loginSchema } from '../schemas/auth';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  permissions: { type: [String], default: [] },
  unit: { type: String, enum: ['main', 'franchise', 'factory'], default: 'main' },
  passwordResetToken:  { type: String, default: null },
  passwordResetExpiry: { type: Date,   default: null },
}, { toJSON: { virtuals: true, versionKey: false } });

export const UserModel = mongoose.models.User || mongoose.model('User', UserSchema);

const router = Router();

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res) => {
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
  res.cookie('soul540_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  res.json({ user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin, permissions: user.permissions, unit: userUnit } });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = (req as any).cookies?.soul540_token;
  if (!token) return res.status(401).json({ error: 'not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'soul540-secret') as any;
    const user = await UserModel.findById(payload.userId).select('-passwordHash').lean() as any;
    if (!user) return res.status(401).json({ error: 'user not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin, permissions: user.permissions, unit: user.unit } });
  } catch {
    res.status(401).json({ error: 'invalid token' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res) => {
  res.clearCookie('soul540_token', { httpOnly: true, sameSite: 'strict' });
  res.json({ ok: true });
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email obrigatório' });

  // Always respond OK to prevent email enumeration
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return res.json({ ok: true });

  // Generate a secure token
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await UserModel.findByIdAndUpdate(user._id, {
    passwordResetToken: hashedToken,
    passwordResetExpiry: expiry,
  });

  // Check if SMTP is configured
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, APP_URL } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return res.status(503).json({
      error: 'Envio de email não configurado. Peça ao administrador para redefinir sua senha diretamente em Permissões.',
    });
  }

  const resetUrl = `${APP_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: parseInt(SMTP_PORT || '587') === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: user.email,
    subject: 'Soul540 — Redefinição de Senha',
    html: `
      <p>Olá, <strong>${user.name}</strong>.</p>
      <p>Você solicitou a redefinição da sua senha. Clique no link abaixo para continuar:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>O link expira em 1 hora. Se você não solicitou isso, ignore este email.</p>
    `,
  });

  res.json({ ok: true });
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Dados inválidos' });
  if (password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpiry: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ error: 'Link inválido ou expirado' });

  const passwordHash = await bcrypt.hash(password, 10);
  await UserModel.findByIdAndUpdate(user._id, {
    passwordHash,
    passwordResetToken: null,
    passwordResetExpiry: null,
  });

  res.json({ ok: true });
});

export default router;
