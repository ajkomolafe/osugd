import axios from 'axios';
import express from 'express';
import jwt from 'jsonwebtoken';
import response_codes from '../response_codes.js';

const router = express.Router();

//Format of unhashed cookie given to browser
// {                
//     expireTime
//     accessToken
//     refreshToken
// }

// async function initUser(cookie){
//     const unhashedCookie = jwt.verify(cookie, process.env.JWT_SECRET)
//     if (unhashedCookie.expireTime == null || unhashedCookie.accessToken == null || unhashedCookie.refreshToken == null){
//         return new Error("initUser: Cookie has invalid format")
//     }
//     try {
//         let response = await axios.get("https://osu.ppy.sh/api/v2/me", {
//             headers: {
//                 "Authorization": "Bearer " + unhashedCookie.accessToken,
//             },
//         })
//         const id = response.data.id
//         const username = response.data.username

//         async function asyncSaveUser(id, username) {
//             // Updates if it exists with id as the search, otherwise creates the object (upsert)
//             // can add other user information here from response.data, will not be returned to the client but put in db
//             await User.updateOne(
//             { id: id },
//             { username: username, },
//             { upsert: true }
//             ).catch((err) => {
//                 console.log(err)
//             })
//             console.log("User " + username + " was saved.")
//         }
//         asyncSaveUser(id, username)
//     }
//     catch (err) {
//         console.log(err)
//     }
// }

//Generates session JWT given code from server
router.get("/", async (req, res) => {
    console.log("GET /api/auth/?code={code}")
    let code = req.query.code
    if (code != null){
        try {
            let response = await axios.post("https://osu.ppy.sh/oauth/token", {
                client_id: process.env.CLIENT_ID.toString(),
                client_secret: process.env.CLIENT_SECRET,
                code: code,
                grant_type: "authorization_code",
                })
            const expiresIn = response.data.expires_in
            const accessToken = response.data.access_token
            const refreshToken = response.data.refresh_token

            const cookie = jwt.sign({
                expireTime: Math.floor(Date.now() / 1000) + expiresIn,
                accessToken: accessToken,
                refreshToken: refreshToken,
            }, process.env.JWT_SECRET)

            return res.status(response_codes.OK).json({
                session: cookie,
            });
        }

        catch (err) {
            console.log("Error: " + err.message)
            console.log(err.response.data)
            if (err.status != null){
                return res.status(response_codes.BAD_REQUEST).json({
                    message: err.message,
                    hint: "ogd: code is likely expired, request a new one"
                })
            }

            return res.status(response_codes.SERVER_ERROR).json({
                message: err.message,
            })
        }
    }
    return res.status(400).json({
        message: "ogd: missing oauth code, should be given as query parameter"
    })
})

export default router;