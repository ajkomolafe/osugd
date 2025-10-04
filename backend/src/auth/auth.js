import axios from 'axios';
import express from 'express';
import jwt from 'jsonwebtoken';
import response_codes from '../response_codes.js';
import getUpdateUser from '../users/getAsyncUpdateUser.js'

const router = express.Router();

//Format of unhashed cookie given to browser
// {                
//     expireTime
//     accessToken
//     refreshToken
// }

//Generates session JWT given code from server, will create/upsert an account in the db so user can request their maps
router.get("/", async (req, res) => {
    console.log("GET /api/auth/?code={code}")
    let code = req.query.code
    if (code == null){
        return res.status(400).json({
            message: "missing oauth code"
        })
    }

    let redirect_uri = req.query.redirect_uri
    if (redirect_uri == null){
        return res.status(400).json({
            message: "missing redirect uri"
        })
    }

    if (code != null && redirect_uri != null){
        try {
            let response = await axios.post("https://osu.ppy.sh/oauth/token", {
                client_id: process.env.CLIENT_ID.toString(),
                client_secret: process.env.CLIENT_SECRET,
                code: code,
                grant_type: "authorization_code",
                redirect_uri: redirect_uri,
                })
            const expiresIn = response.data.expires_in
            const accessToken = response.data.access_token
            const refreshToken = response.data.refresh_token

            const cookie = jwt.sign({
                expireTime: Math.floor(Date.now() / 1000) + expiresIn,
                accessToken: accessToken,
                refreshToken: refreshToken,
            }, process.env.JWT_SECRET)

            getUpdateUser(cookie)

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
                    hint: "code is likely expired, request a new one"
                })
            }

            return res.status(response_codes.SERVER_ERROR).json({
                message: err.message,
            })
        }
    }
})

export default router;