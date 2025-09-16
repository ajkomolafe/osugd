import axios from "axios"
import { BACKEND_ADDRESS } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
    const { link, difficulty } = await request.json()
	try { 
        const session = cookies.get('session')
        let response = await axios.post(BACKEND_ADDRESS + "/api/users/add_beatmapset", {
            link: link,
            difficulty: difficulty,
        }, {
            headers: {
                'Cookie': "session=" + session
            }
        })
        console.log(response.data)
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

	// return new Response(number, {
	// 	headers: {
	// 		'Content-Type': 'application/json'
	// 	}
	// });
}