import axios from 'axios';
import express from 'express';
import jwt from 'jsonwebtoken';
import { getCookie } from '../cookie.js'
import { response_codes } from '../response_codes.js';

const router = express.Router();

/*Error numbers
200~ Good request
400~ User fault
500~ Server fault
*/

// GET: Get User
router.get("/", async (req, res) => {
    const cookie = getCookie(req, "session")
    if (cookie == null) {
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "missing cookie"
        })
    }

    let unhashedCookie;
    try {
        unhashedCookie = jwt.verify(cookie, process.env.JWT_SECRET)
        if (unhashedCookie.expireTime == null || unhashedCookie.accessToken == null || unhashedCookie.refreshToken == null){
            return res.status(response_codes.BAD_REQUEST).json({
                hint: "cookie is an invalid format"
            })
        }   
    }
    catch {
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "cookie is an invalid format"
        })
    }

    try {
        let response = await axios.get("https://osu.ppy.sh/api/v2/me", {
            headers: {
                "Authorization": "Bearer " + unhashedCookie.accessToken,
            },
        })

        const username = response.data.username
        const avatar_url = response.data.avatar_url
        
        console.log("GET /api/users/: " + username)

        return res.status(response_codes.OK).json({
            username: username,
            avatar_url: avatar_url,
        });
    }
    catch (err) {
         console.log("GET /api/users/: Error: " + err.message)
        if (err.status != null){
            return res.status(response_codes.BAD_REQUEST).json({
                message: err.message,
                hint: "cookie is likely expired"
            })
        }
        return res.status(response_codes.SERVER_ERROR).json({
            message: err.message,
        })
    }
})

export default router;