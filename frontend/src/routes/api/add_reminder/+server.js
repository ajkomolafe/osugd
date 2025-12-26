import axios from "axios"
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/public';

const CLIENT_ID = env.PUBLIC_CLIENT_ID;
const BACKEND_ADDRESS = env.PUBLIC_BACKEND_ADDRESS;

export async function POST({ request, cookies }) {
    const { start_time, frequency } = await request.json()
	try { 
        const session = cookies.get('session')
        let response = await axios.post(BACKEND_ADDRESS + "/api/reminders", {
            start_time: start_time,
            frequency: frequency,
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