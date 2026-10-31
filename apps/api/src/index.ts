import 'dotenv/config';
import { startApiServer } from './start-api';

void startApiServer().catch((error) => {
  console.error('Falha ao iniciar API:', error);
  process.exitCode = 1;
});
