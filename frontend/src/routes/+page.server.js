import axios from 'axios';
import { BACKEND_ADDRESS } from '$env/static/private';

async function getBeatmapsets(session, completed){
    let response = await axios.get(BACKEND_ADDRESS + "/api/beatmapsets", {
        headers: {
            'Cookie': "session=" + session
        },
        params: {
            completed: completed,
        },
    })

    let beatmapsets = response.data.beatmapsets

    return beatmapsets
}

export async function load({ parent, cookies, url, depends }) {
    //Waits for the cookie to be set by the layout load function
    depends('custom:layout');
    depends('custom:page');
    await parent()
    let session = cookies.get("session");
    if (session != null) {
        try {
            const [wip, completed] = await Promise.all([
                getBeatmapsets(session, false),
                getBeatmapsets(session, true),
            ])
            // const max_length = Math.min(Math.max(wip.length, completed.length, 1), 10)
            while (wip.length < 2 || wip.length % 2 == 1){
                wip.push(null)
            }
            while (completed.length < 2 || completed.length % 2 == 1){
                completed.push(null)
            }

            return {
                beatmapsets: {
                    wip: wip,
                    completed: completed,
                }
            }
        }
        catch (err) {
            if (err.response != null && err.response.data != null){
                console.log(err.response.data)
            } 
            else {
                console.log(err)
            }
        }
    }

    return {
        beatmapsets: {
            wip: [null],
            completed: [null],
        }
    }
}