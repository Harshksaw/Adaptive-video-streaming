import { Router } from 'express';
import exampleRouter from './example.routes.js';
import videoRouter from './video.routes.ts'
const router = Router();

router.use('/example', exampleRouter);
router.use('/video', videoRouter);





export default router;
