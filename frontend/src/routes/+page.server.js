import axios from 'axios';
import { BACKEND_ADDRESS } from '$env/static/private';

async function getBeatmapsets(session, type){
    let response = await axios.get(BACKEND_ADDRESS + "/api/beatmapsets", {
        headers: {
            'Cookie': "session=" + session
        },
        params: {
            type: type,
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
            const [graved, pending, ranked] = await Promise.all([
                getBeatmapsets(session, "graveyard"),
                getBeatmapsets(session, "pending"),
                getBeatmapsets(session, "ranked"),
            ])
            const max_length = Math.min(Math.max(graved.length, pending.length, ranked.length), 3)
            while (graved.length < max_length){
                graved.push(null)
            }
            while (pending.length < max_length){
                pending.push(null)
            }
            while (ranked.length < max_length){
                ranked.push(null)
            }

            return {
                beatmapsets: {
                    graved: graved,
                    pending: pending,
                    ranked: ranked,
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
            graved: [null, null],
            pending: [null, null],
            ranked: [null, null],
        }
    }
}