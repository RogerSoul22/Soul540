import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { UserModel } from '../modules/identity/auth.routes';
async function seed() {
  await connectDatabase();
  const count = await UserModel.countDocuments();
  if (count > 0) {
    console.log('Usuarios ja existem, seed ignorado.');
    process.exit(0);
  }
  const ALL_PERMISSIONS = [
    'dashboard',
    'eventos',
    'tarefas',
    'funcionarios',
    'contratantes',
    'financeiro',
    'notas-fiscais',
    'contratos',
    'franquias',
    'cardapios',
    'estoque-insumos',
    'estoque-utensilios',
    'chat',
    'usuario',
  ];
  const passwordHash = await bcrypt.hash('123456', 10);
  await UserModel.create({
    name: 'Administrador',
    email: 'admin@soul540.com',
    passwordHash,
    isAdmin: true,
    permissions: ALL_PERMISSIONS,
  });
  console.log('Admin criado: admin@soul540.com / 123456');
  process.exit(0);
}

seed().catch(console.error);
