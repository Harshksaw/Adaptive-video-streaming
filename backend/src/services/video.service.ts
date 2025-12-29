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


]



export const processVideoForHLS = (
    inputPath:string,
    outputPath:string,
    callback: (error :Error | null, masterPlayList: string) => void) : void => {


            const masterPlaylist = `${outputPath}/master.m3u8`;

            const masterContent:string[] = [];

            let countProcessing = 0

            resolutions.forEach( resolution => {
                const variantOutput = `${outputPath}/video_${resolution.height}p`;

                const variantPlaylist = `${variantOutput}/playlist.m3u8`;

                fs.mkdirSync(variantOutput, {recursive: true})

                ffmpeg(inputPath)
                .outputOptions([
                    '-vf scale=w=' + resolution.width + ':h=' + resolution.height,
                    `-b:v ${resolution.bitRate}k`,
                    '-codec:v libx264',
                    '-codec:a aac',
                    '-hls_time 10',
                    '-hls_playlist_type vod',
                    `-hls_segment_filename ${variantOutput}/segment_%03d.ts`
                ])
                .output(variantPlaylist)
                .on('end', () => {
                    //When the processing of this variant is done, add it to the master playlist
                    masterContent.push(
                        `#EXT-X-STREAM-INF:BANDWIDTH=${resolution.bitRate * 1000},RESOLUTION=${resolution.width}x${resolution.height}\n${resolution.height}p/playlist.m3u8` 

                    )
                    countProcessing+=1;
                    if(countProcessing === resolutions.length){
                        console.log('All variants processed, writing master playlist');
                        //All variants processed, write the master playlist
                        fs.writeFileSync(masterPlaylist, '#EXTM3U\n' + masterContent.join('\n'));
                        callback(null, masterPlaylist);
                    }
                })
                .on('error', (err) => {
                    console.error('Error processing variant:', err);
                    callback(err, '');
                })
                .run();







            })
    }
    
