import axios from "axios"
import { BACKEND_ADDRESS } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const { link, difficulty, wip_status } = await request.json()
	try { 
        const session = cookies.get('session')
        let response = await axios.post(BACKEND_ADDRESS + "/api/beatmapsets", {
            link: link,
            difficulty: difficulty,
            wip_status: wip_status,
        }, {
            headers: {
                'Cookie': "session=" + session
            }
        })
        return json({
            error: null,
        })
    }
    catch (err) {
        console.log(err.response.data)
        return json({
            error: err.response.data,
        })
    }
}

export async function DELETE({ request, cookies }) {
    const { beatmapset_id } = await request.json()
	try { 
        const session = cookies.get('session')
        let response = await axios.delete(BACKEND_ADDRESS + "/api/beatmapsets", {
            data: {
                beatmapset_id: beatmapset_id,
            },
            headers: {
                'Cookie': "session=" + session
            }
        })
        return json({
            error: null,
        })
    }
    catch (err) {
        console.log(err.response.data)
        return json({
            error: err.response.data,
        })
    }
}