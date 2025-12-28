import { Router } from 'express';
import upload from '../middleware/multer.middleware.js'
import uploadVideoController from '../controllers/video.controller.js'


const videoRouter = Router();



videoRouter.post('/upload', upload.single('video'), uploadVideoController)

export default videoRouter;