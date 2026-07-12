import 'dotenv/config';
import { connectDB } from './db';
import app from './app';
import { backfillEventFinances } from './routes/events';

const PORT = process.env.PORT || 3001;

console.log('MONGO_URI defined:', !!process.env.MONGO_URI);
console.log('Env keys:', Object.keys(process.env).join(', '));

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

connectDB()
  .then(async () => {
    const result = await backfillEventFinances();
    console.log(`Finance backfill completed: ${result.main} main, ${result.franchise} franchise events`);
  })
  .catch((err) => console.error('Falha ao conectar/sincronizar MongoDB:', err));
