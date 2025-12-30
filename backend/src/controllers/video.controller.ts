import type { Request, Response } from 'express';
import { processVideoForHLS } from '../services/video.service.js';
import { randomUUID } from 'crypto';
import path from 'path';

const uploadVideoController = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'No file uploaded'
        });
    }

    const videoId = randomUUID();
    const inputPath = req.file.path;
    const outputPath = path.join('outputs', videoId);

    // Start processing asynchronously
    processVideoForHLS(inputPath, outputPath, (error, masterPlaylist) => {
        if (error) {
            console.error('Error processing video:', error);
            return;
        }
        console.log(`Video ${videoId} processed successfully. Master playlist: ${masterPlaylist}`);
    });

    // Immediately return response to user
    return res.status(202).json({
        success: true,
        message: 'Video upload initiated. Processing has started.',
        videoId: videoId,
        streamUrl: `/api/video/${videoId}/master.m3u8`
    });
};

export default uploadVideoController;