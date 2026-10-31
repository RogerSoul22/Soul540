import app from './app';
import { connectDatabase } from './config/database';
import { getJwtSecret } from './infrastructure/security/jwt-secret';

type Listen = (port: string | number, callback: () => void) => unknown;

export type ApiBootstrapDependencies = {
  validateJwtSecret?: () => string;
  connect?: () => Promise<unknown>;
  listen?: Listen;
  log?: (message: string) => void;
};

export async function startApiServer({
  validateJwtSecret = getJwtSecret,
  connect = connectDatabase,
  listen = (port, callback) => app.listen(port, callback),
  log = console.log,
}: ApiBootstrapDependencies = {}) {
  const port = process.env.PORT || 3001;
  validateJwtSecret();
  await connect();
  listen(port, () => log(`Server running on port ${port}`));
}
