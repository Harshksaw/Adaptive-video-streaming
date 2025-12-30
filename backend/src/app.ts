import express, { type Application } from 'express';
import router from './routes/index.js';
import path from 'path';
import cors from 'cors';

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from outputs directory
app.use('/outputs', express.static(path.join(process.cwd(), 'outputs')));

app.use('/api', router);

export default app;
