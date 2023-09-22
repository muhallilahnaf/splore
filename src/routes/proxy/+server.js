import { error } from '@sveltejs/kit';

export const GET = async ({ request }) => {

    // get target-url header
    const targetURL = request.headers.get('target-url')

    // throw error if no target-url header
    if (!targetURL) throw error(500, 'There is no Target-URL header in the request');
    console.log('target-url: ' + targetURL);

    // if pinging, send response
    if (targetURL == 'ping') return new Response('pong')

    // fetch the target-url
    const hostname = new URL(targetURL).hostname;
    const response = await fetch(targetURL, {
        headers: {
            'Host': hostname,
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': `https://${hostname}/`,
            'Sec-Ch-Ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
            'Sec-Ch-Ua-Mobile': '?0',
            'Sec-Ch-Ua-Platform': '"Windows"',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        }
    })

    // parse the response body and send the response back
    const body = await response.text()
    return new Response(body)

    // add cors headers if needed
    // const cors = {
    //     headers: {
    //         'Access-Control-Allow-Origin': '*',
    //         'Access-Control-Allow-Methods': 'GET, PUT, PATCH, POST, DELETE',
    //         'Access-Control-Allow-Headers': request.headers.get('access-control-request-headers')
    //     }
    // }
    // return new Response(body, cors)
}