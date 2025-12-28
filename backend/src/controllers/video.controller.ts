import type { Request, Response } from 'express'



const uploadVideoController = async(req : Request, res:Response)=>{

    if(!req.file){
        return res.status(400).json({message: 'No file uploaded'})
    }

    // Here you can handle the uploaded file (req.file)
    // For example, save file info to database, process the file, etc.

    const videoPath = req.file.path;
    

    
    return res.status(200).json({message: 'Video uploaded successfully', path: videoPath})

}

export default uploadVideoController