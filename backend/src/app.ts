import express, { type Application } from 'express';
import router from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from outputs directory
app.use('/outputs', express.static(path.join(__dirname, '../outputs')));

app.use('/api', router);

export default app;
