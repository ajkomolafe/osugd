import axios from 'axios';
import { env } from '$env/dynamic/public';

const CLIENT_ID = env.PUBLIC_CLIENT_ID;
const BACKEND_ADDRESS = env.PUBLIC_BACKEND_ADDRESS;

// try getuser with session, if expired, get cookie and retry

async function getCookie(cookies, code, redirect_uri){
    let response = await axios.get(BACKEND_ADDRESS + "/api/auth", { 
        params: {
            code: code,
            redirect_uri: redirect_uri,
        },
        withCredentials: true, 
    })

    cookies.set("session", response.data.session, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 10 * 365 * 24 * 60 * 60 // 10 years
    });
}

async function getUser(session){
    let response = await axios.get(BACKEND_ADDRESS + "/api/users", {
        headers: {
            'Cookie': "session=" + session
        }
    })

    if (response.data.username == null || response.data.avatar_url == null){
        return {
            user: null,
            toast: true,
        }
    }

    const username = response.data.username
    const avatar_url = response.data.avatar_url

    return {
        user: {
            username: username,
            avatar_url: avatar_url,
        },
        toast: false,
    }
}

async function refreshSession(cookies, session){
    let response = await axios.put(BACKEND_ADDRESS + "/api/auth", {
        headers: {
            'Cookie': "session=" + session
        }
    })

    cookies.set("session", response.data.session, {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 10 * 365 * 24 * 60 * 60 // 10 years
    });
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

        // If failure on getting user, try refresh and get user again
        try {
            await refreshSession(cookies, session)
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

    const code = url.searchParams.get("code");
    if (code != null){
        try {
            await getCookie(cookies, code, url.origin)
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
        toast: false,
    }
}