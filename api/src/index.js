// FILE: api/src/index.js
import 'dotenv/config';
import { connectDB } from './db.js';
import { createApp } from './app.js';

const app = createApp();
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
connectDB();
