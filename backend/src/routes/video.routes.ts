import {express } from 'express';
import upload from '../middleware/multer.middleware.ts'
import {uploadVideoController} from  '../controllers/video.controller.ts'


const videoRouter = express.Router();



videoRouter.post('upload', upload.single(''), uploadVideoController)