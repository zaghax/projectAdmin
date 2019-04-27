export const getVideos = async (params)  => {

    const defaultParams = [
        'https://www.googleapis.com/youtube/v3/search',
        '?part=snippet',
        '&type=video',
        '&videoDuration=medium',
        // `&key=${API_KEY}`,
        // '&key=AIzaSyC68vEAmg9rnK58aoTP2yePI7FcWgJinFw'
        '&key=AIzaSyAUWZUfmzfGrPsvtxZ_RdnTWX3alQUaEJo'
        
    ]

    const URL = defaultParams.join('') + params.join('');

    const response = await fetch(URL);
    
    return response;
}