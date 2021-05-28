import {API_KEY} from '../../API_KEY/API_KEY'
export const getVideos = async (params)  => {

    const defaultParams = [
        'https://youtube.googleapis.com/youtube/v3/search',
        '?part=snippet',
        '&type=video',
        '&videoDuration=medium',
        '&videoCategoryId=10',
        API_KEY
        
    ]
    console.log('params', params)

    const URL = defaultParams.join('') + params.join('');

    const response = await fetch(URL);
    
    return response;
}