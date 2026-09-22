import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env') });

import { supabase } from './supabase.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'SK Finance Management API is live',
    endpoints: {
      health: '/api/health',
      supabaseStatus: '/api/supabase-status'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SK Finance API server is running' });
});

app.get('/api/supabase-status', async (req, res) => {
  const isConfigured = Boolean(
    process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY)
  );

  if (!isConfigured) {
    return res.status(400).json({
      status: 'unconfigured',
      message: 'Supabase URL or keys are missing in server/.env'
    });
  }

  try {
    // Ping Supabase to verify connection
    const { error } = await supabase.auth.getSession();
    if (error) throw error;
    res.json({ status: 'connected', message: 'Supabase connected successfully' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
