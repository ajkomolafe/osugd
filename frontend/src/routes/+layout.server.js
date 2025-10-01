import axios from 'axios';
import { BACKEND_ADDRESS } from '$env/static/private';

// try getuser with session, if expired, get cookie and retry

async function getCookie(cookies, code){
    let response = await axios.get(BACKEND_ADDRESS + "/api/auth", { 
        params: {
            code: code,
        },
        withCredentials: true, 
    })

    cookies.set("session", response.data.session, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 // 1 day
    });
}

async function getUser(session){
    let response = await axios.get(BACKEND_ADDRESS + "/api/users/me", {
        headers: {
            'Cookie': "session=" + session
        }
    })

    const username = response.data.username
    const avatar_url = response.data.avatar_url

    return {
        user: {
            username: username,
            avatar_url: avatar_url,
        },
    }
}

export async function load({ cookies, url, depends }) {
    depends('custom:layout');
    let session = cookies.get("session");
    if (session != null) {
        try {
            let res = await getUser(session)
            return res
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

    const code = url.searchParams.get("code");
    if (code != null){
        try {
            await getCookie(cookies, code)
            session = cookies.get("session");
            let res = await getUser(session)
            return res
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
        user: null,
    }
}