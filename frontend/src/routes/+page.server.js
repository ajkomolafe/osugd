import axios from 'axios';
import { BACKEND_ADDRESS } from '$env/static/private';
// import { redirect, isRedirect } from '@sveltejs/kit';

async function getBeatmapsets(session, type){
    let response = await axios.get(BACKEND_ADDRESS + "/api/users/get_beatmapsets", {
        headers: {
            'Cookie': "session=" + session
        },
        params: {
            type: type,
        },
    })

    let beatmapsets = response.data.beatmapsets
    while (beatmapsets.length < 2){
        beatmapsets.push(null)
    }

    return beatmapsets
}

export async function load({ cookies, url }) {
    let session = cookies.get("session");
    if (session != null) {
        try {
            const [graved, pending, ranked] = await Promise.all([
                getBeatmapsets(session, "graved"),
                getBeatmapsets(session, "pending"),
                getBeatmapsets(session, "ranked"),
            ])

            return {
                beatmapsets: {
                    graved: graved,
                    pending: pending,
                    ranked: ranked,
                }
            }
        }
        catch (err) {
            console.log(err.response.data)
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