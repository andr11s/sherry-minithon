import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';

export const app = express();
export const PORT = process.env.PORT || 3000;

app.use('/public', express.static(path.join(process.cwd(), 'public')));

// Configuración de CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
