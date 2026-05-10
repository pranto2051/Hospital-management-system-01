import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Initialize data file if it doesn't exist
async function initDataFile() {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({
      profiles: [],
      attendance: [],
      patients: [],
      appointments: [],
      prescriptions: [],
      labReports: [],
      admissions: []
    }));
  }
}

async function readData() {
  const content = await fs.readFile(DATA_FILE, 'utf-8');
  return JSON.parse(content);
}

async function writeData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  await initDataFile();
  const app = express();
  const PORT = 3000;

  // Trust proxy for correct IP detection behind Nginx
  app.set('trust proxy', 1);

  // Security Middleware
  app.use(helmet({
    contentSecurityPolicy: false, // Disabled for Vite dev mode
  }));
  app.use(cors());
  app.use(express.json());

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
  });
  app.use('/api/', limiter);

  // Generic CRUD Endpoints
  app.get('/api/:table', async (req, res) => {
    try {
      const { table } = req.params;
      const { tenantId } = req.query;
      const data = await readData();
      
      if (!data[table]) {
        return res.json([]);
      }

      const records = tenantId 
        ? data[table].filter((a: any) => a.tenantId === tenantId)
        : data[table];
      res.json(records);
    } catch (error) {
      res.status(500).json({ error: `Failed to fetch ${req.params.table}` });
    }
  });

  app.post('/api/:table', async (req, res) => {
    try {
      const { table } = req.params;
      const record = req.body;
      const data = await readData();
      
      if (!data[table]) {
        data[table] = [];
      }
      
      const existingIndex = data[table].findIndex((a: any) => a.id === record.id);
      if (existingIndex !== -1) {
        data[table][existingIndex] = record;
      } else {
        data[table].unshift(record);
      }
      
      await writeData(data);
      res.status(existingIndex !== -1 ? 200 : 201).json(record);
    } catch (error) {
      res.status(500).json({ error: `Failed to save ${req.params.table}` });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🏥 MedCore HMS Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
