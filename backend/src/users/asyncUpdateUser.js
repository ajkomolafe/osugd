import axios from 'axios'
import jwt from 'jsonwebtoken';
import User from "./user.js"

export default async function updateUser(cookie){
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
        const id = response.data.id
        const username = response.data.username

        async function asyncSaveUser(id, username) {
            // Updates if it exists with id as the search, otherwise creates the object (upsert)
            // can add other user information here from response.data, will not be returned to the client but put in db
            await User.updateOne(
            { id: id },
            { username: username, },
            { upsert: true }
            ).catch((err) => {
                console.log(err)
            })
            console.log("initUser\n\t" + username + " upserted to db")
        }
        asyncSaveUser(id, username)
    }
    catch (err) {
        console.log(err)
    }
}