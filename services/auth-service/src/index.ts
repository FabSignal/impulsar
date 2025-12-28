// CRITICAL: Load environment variables first (from .env file if present)
import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

// CRITICAL: All imports must be at the top in ESM/TypeScript
import express from 'express';
import cors from 'cors';
import { validateAuthEnv } from '@impulsar/config';

const rootEnvPath = resolve(process.cwd(), '../../.env');
const localEnvPath = resolve(process.cwd(), '.env');

loadEnv({ path: rootEnvPath });
loadEnv({ path: localEnvPath, override: true });

// CRITICAL: Validate environment FIRST before any other setup
// Auth service validates: SUPABASE_*, JWT_SECRET, AUTH_SERVICE_PORT
// Does NOT require: STELLAR_OPERATIONAL_SECRET_KEY (transfer-service responsibility)
const env = validateAuthEnv(process.env);

const app = express();
const PORT = env.AUTH_SERVICE_PORT;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({
    service: 'auth-service',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Auth domain routes
app.post('/api/auth/register', (_req, res) => {
  res.json({ message: 'User registration endpoint - to be implemented' });
});

app.post('/api/auth/login', (_req, res) => {
  res.json({ message: 'User login endpoint - to be implemented' });
});

app.post('/api/auth/refresh', (_req, res) => {
  res.json({ message: 'Token refresh endpoint - to be implemented' });
});

app.post('/api/auth/logout', (_req, res) => {
  res.json({ message: 'User logout endpoint - to be implemented' });
});

app.listen(PORT, () => {
  // NOTE: For production, replace console.log with structured logging (pino or winston)
  // This placeholder is acceptable for development/learning purposes
  console.log(`🚀 Auth Service running on http://localhost:${PORT}`);
});
