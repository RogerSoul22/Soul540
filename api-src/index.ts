import 'dotenv/config';
import { connectDB } from '../server/db';
import app from '../server/app';

let dbConnected = false;

const handler = async (req: any, res: any) => {
  if (!dbConnected) {
    await connectDB();
    dbConnected = true;
  }
  app(req, res);
};

module.exports = handler;
