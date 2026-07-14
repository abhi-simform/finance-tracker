import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finance-tracker';
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    console.warn('MongoDB not reachable yet, API will retry on first request:', err.message);
  }
}

export function ensureConnected(req, res, next) {
  if (mongoose.connection.readyState === 1) return next();
  return res.status(503).json({ error: 'Database unavailable, please try again shortly' });
}
