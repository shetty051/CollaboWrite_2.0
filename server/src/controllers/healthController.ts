import { Request, Response } from 'express';
import mongoose from 'mongoose';

export const getHealth = (req: Request, res: Response): void => {
  const connectionStates: Record<number, string> = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  const dbState = mongoose.connection.readyState;
  const dbStatus = connectionStates[dbState] || 'Unknown';

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: dbStatus,
  });
};
