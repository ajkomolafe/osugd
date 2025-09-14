import axios from 'axios';
import express from 'express';
import userSchema from './user.js';
import jwt from 'jsonwebtoken';
import response_codes from '../response_codes.js';

const router = express.Router();

/*Error numbers
200~ Good request
400~ User fault
500~ Server fault
*/

function getCookie(req, name) {
    // user=someone; session=mySessionID
    if (req.headers.cookie == null){
        return null
    }
    const cookies = req.headers.cookie.split('; ');
    for (const cookie of cookies){
        if (cookie.startsWith(name)){
            return cookie.substring(name.length + 1, cookie.length)
        }
    }
    return null
}

router.get("/me", async (req, res) => {
    console.log("GET /api/users/me")
    const cookie = getCookie(req, "session")
    if (cookie == null) {
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "missing cookie"
        })
    }
    const unhashedCookie = jwt.verify(cookie, process.env.JWT_SECRET)
    if (unhashedCookie.expireTime == null || unhashedCookie.accessToken == null || unhashedCookie.refreshToken == null){
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
        // const id = response.data.id
        const username = response.data.username
        const avatar_url = response.data.avatar_url

        return res.status(response_codes.OK).json({
            username: username,
            avatar_url: avatar_url,
        });
    }
    catch (err) {
        console.log("Error: " + err.message)
        //api request failure
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

// //Create a user, json as param
// router.post("/", async (req, res) => {
//     const user = new userSchema({
//         full_name: req.body.full_name,
//         email: req.body.email,
//         auth: ""
//     });

//     try {
//         const savedStatus = await user.save();
//         res.status(201).json(savedStatus);
//     }
//     catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// //Update one user
// router.patch("/:email", async (req, res) => {
//     try {
//         var user = await userSchema.findOne({ email: req.params.email });
//         if (req.body.full_name != null){
//             user.full_name = req.body.full_name;
//         }
//         const updateStatus = user.save();
//         res.json(updateStatus);
//     }
//     catch (err){
//         res.status(400).json({ message: err.message });
//     }
// });

export default router;