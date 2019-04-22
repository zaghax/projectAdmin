// export async function getVideos( params ) {

//     const defaultParams = [
//         'https://www.googleapis.com/youtube/v3/search',
//         '?part=snippet',
//         '&type=video',
//         '&videoDuration=medium',
//         // `&key=${API_KEY}`,
//         '&key=AIzaSyC68vEAmg9rnK58aoTP2yePI7FcWgJinFw'
        
//     ]

//     const URL = defaultParams.join('') + params.join('');
//     let videoItems = {};


//     const response = await fetch(URL)

//     const data = await response.json()

//     return data;

//     // fetch(URL)
//     //     .then((response) => response.json())
//     //     .then(response => {
//     //         videoItems = response.items;
//     //         console.log(response.items) 

//     //     })

//     // return videoItems;

    
// }


export async function getVideos(params) {

    const defaultParams = [
        'https://www.googleapis.com/youtube/v3/search',
        '?part=snippet',
        '&type=video',
        '&videoDuration=medium',
        // `&key=${API_KEY}`,
        '&key=AIzaSyC68vEAmg9rnK58aoTP2yePI7FcWgJinFw'
        
    ]

    const URL = defaultParams.join('') + params.join('');

    const response = await fetch(URL);
    // const newResp = await response.json();
    // const items = await newResp.items
    
    return response

    // try {
        
    //   } catch (err) {
    //        console.log(err)
    // }

}
