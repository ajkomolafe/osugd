import axios from "axios"
import { BACKEND_ADDRESS } from '$env/static/private';
import { json } from '@sveltejs/kit';

export async function GET({ cookies }) {
	cookies.delete('session', { path: '/' });

    return json({});
}