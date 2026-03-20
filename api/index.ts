import 'dotenv/config';
import { connectDB } from '../server/db';
import app from '../server/app';

let dbConnected = false;

export default async function handler(req: any, res: any) {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  app(req, res);
}
