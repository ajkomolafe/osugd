import axios from 'axios'
import jwt from 'jsonwebtoken';
import User from "./user.js"

async function getUpdateUser(cookie){
    const unhashedCookie = jwt.verify(cookie, process.env.JWT_SECRET)
    if (unhashedCookie.expireTime == null || unhashedCookie.accessToken == null || unhashedCookie.refreshToken == null){
        return new Error("cookie has invalid format")
    }
    try {
        let response = await axios.get("https://osu.ppy.sh/api/v2/me", {
            headers: {
                "Authorization": "Bearer " + unhashedCookie.accessToken,
            },
        })
        const ogd_user_id = response.data.id
        const username = response.data.username

        async function asyncSaveUser(id, username) {
            // Updates if it exists with id as the search, otherwise creates the object (upsert)
            // can add other user information here from response.data, will not be returned to the client but put in db
            await User.updateOne(
            { ogd_user_id: ogd_user_id },
            { username: username, },
            { upsert: true }
            ).catch((err) => {
                console.log(err)
            })
            console.log("initUser\n\t" + username + " upserted to db")
        }
        asyncSaveUser(ogd_user_id, username)

        return {
            ogd_user_id: ogd_user_id,
            username: username,
        }
    }
    catch (err) {
        console.log(err)
    }
}

async function getUser(cookie){
    const unhashedCookie = jwt.verify(cookie, process.env.JWT_SECRET)
    if (unhashedCookie.expireTime == null || unhashedCookie.accessToken == null || unhashedCookie.refreshToken == null){
        return new Error("cookie has invalid format")
    }
    try {
        let response = await axios.get("https://osu.ppy.sh/api/v2/me", {
            headers: {
                "Authorization": "Bearer " + unhashedCookie.accessToken,
            },
        })
        const ogd_user_id = response.data.id
        const username = response.data.username

        return {
            ogd_user_id: ogd_user_id,
            username: username,
        }
    }
    catch (err) {
        console.log(err)
    }
}

export { getUpdateUser, getUser }