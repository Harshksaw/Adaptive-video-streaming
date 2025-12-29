import express, { type Application } from 'express';
import router from './routes/index.js';

import cors from 'cors';



const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', router);

export default app;
