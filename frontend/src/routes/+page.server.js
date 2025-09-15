import axios from 'axios';
import { BACKEND_ADDRESS } from '$env/static/private';
// import { redirect, isRedirect } from '@sveltejs/kit';

async function getBeatmaps(session, beatmapType){
    
}

export async function load({ cookies, url }) {
    let session = cookies.get("session");
    if (session != null) {
        try {
            
        }
        catch (err) {
            console.log(err.response.data)
        }
    }

    return {
        beatmaps: null,
    }
}