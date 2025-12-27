import { Router } from 'express';
import exampleRouter from './example.routes.js';

const router = Router();

router.use('/example', exampleRouter);





export default router;
