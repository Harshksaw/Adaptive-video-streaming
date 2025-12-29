import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';


interface Resolution{
    width: number;
    height: number;
    bitRate: number;
}

const resolutions: Resolution[] = [
    {width: 1920, height: 1080, bitRate: 4500 },
    { width: 1280, height: 720, bitRate: 2500 },
    { width: 854, height: 480, bitRate: 1200 },
    { width: 640, height: 360, bitRate: 800 },
    { width: 426, height: 240, bitRate: 400 },
    { width: 256, height: 144, bitRate: 200 },
]



export const processVideoForHLS = (
    inputPath:string,
    outputPath:string,
    callback: (error :Error | null, masterPlayList: string) => void) : void => {


            const masterPlaylist = `${outputPath}/master.m3u8`;

            const masterContent:string[] = [];

            resolutions.forEach( resolution => {
                const variantOutput = `${outputPath}/video_${resolution.height}p`;

                const variantPlaylist = `${variantOutput}/playlist.m3u8`;

                fs.mkdirSync(variantOutput, {recursive: true})

                ffmpeg(inputPath)
                .outputOptions([
                    '-vf scale=w=' + resolution.width + ':h=' + resolution.height,
                    `-b:v ${resolution.bitRate}k`,
                    '-codec:v aac',
                    '-codec:a aac',
                    '-hls_time 10',
                    '-hls_playlist_type vod',
                    `-hls_segment_filename ${variantOutput}/segment_%03d.ts`
                ])






            })
    }
    
