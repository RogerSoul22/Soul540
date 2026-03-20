import 'dotenv/config';
import { connectDB } from '../server/db';
import app from '../server/app';

let dbConnected = false;

export default async function handler(req: any, res: any) {
  try {
    if (!dbConnected) {
      await connectDB();
      dbConnected = true;
    }
    app(req, res);
  } catch (err: any) {
    res.status(500).json({ error: err.message, stack: err.stack?.split('\n')[0] });
  }
}
