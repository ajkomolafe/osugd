import axios from 'axios';
import express from 'express';
import jwt from 'jsonwebtoken';
import response_codes from '../response_codes.js';

const router = express.Router();

/*Error numbers
200~ Good request
400~ User fault
500~ Server fault
*/

//Generates session JWT given code from server
router.get("/", async (req, res) => {
    console.log("GET /users/validate?code={code}")
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
                expireTime: math.floor(Date.now() / 1000) + expiresIn,
                accessToken: accessToken,
                refreshToken: refreshToken,
            }, process.env.JWT_SECRET)

            // console.log(jwt.verify(cookie, process.env.JWT_SECRET))
            res.status(response_codes.OK).json({
                cookie: cookie
            });
        }

        catch (err) {
            console.log("Error: " + err.message)
            //api request failure
            if (err.status != null){
                res.status(response_codes.BAD_REQUEST).json({
                    message: err.message,
                    hint: "ogd: code is likely expired, request a new one"
                })
            }
            else {
                res.status(response_codes.SERVER_ERROR).json({
                    message: err.message,
                })
            }
        }
    }
    else {
        res.status(400).json({
            message: "ogd: missing oauth code, should be given as query parameter"
        })
    }
})

export default router;