import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database';

async function run() {
  await connectDatabase();
  const result = await mongoose.connection.collection('users').updateMany({}, { $unset: { passwordPlain: '' } });
  console.log(`Cleared passwordPlain from ${result.modifiedCount} users`);
  await mongoose.disconnect();
}
run();
