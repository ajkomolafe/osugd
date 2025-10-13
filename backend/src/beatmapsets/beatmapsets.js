import axios from 'axios';
import express from 'express';
import Beatmapset from '../beatmapsets/beatmapset.js'
import jwt from 'jsonwebtoken';
import { getCookie } from '../cookie.js'
import { response_codes } from '../response_codes.js';

const router = express.Router();

function parseLink(link){
    const beatmapsetsPrefix = "https://osu.ppy.sh/beatmapsets/";
    const sPrefix = "https://osu.ppy.sh/s/"
    
    if (link.startsWith(beatmapsetsPrefix)){
        let id = link.substring(beatmapsetsPrefix.length);
        const hashIndex = id.indexOf('#');
        if (hashIndex !== -1){
            id = id.substring(0, hashIndex);
        }
        return id;
    }
    else if (link.startsWith(sPrefix)){
        let id = link.substring(sPrefix.length);
        const hashIndex = id.indexOf('#');
        if (hashIndex !== -1){
            id = id.substring(0, hashIndex);
        }
        return id;
    }
    return null
}

// GET: Get Beatmapsets (Paginated)
router.get("/", async (req, res) => {
    const type = req.query.type
    if (type != "graveyard" && type != "pending" && type != "ranked"){
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "invalid beatmap type"
        })
    }

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
        const ogd_user_id = response.data.id

        const beatmapsets = await Beatmapset.find({
            ogd_user_id: ogd_user_id,
            status: type,
        }).limit(3);

        console.log("GET /api/beatmapsets/: " + response.data.username)

        return res.status(response_codes.OK).json({
            beatmapsets: beatmapsets
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

// POST: Add/Upsert Beatmapset
router.post("/", async (req, res) => {
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
    
    const link = req.body.link
    let beatmapsetId = parseLink(link)
    if (beatmapsetId == null){
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "link is invalid"
        })
    }
    const difficulty = req.body.difficulty
    if (difficulty == null || difficulty == "") {
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "difficulty is empty"
        })
    }

    try {
        let response = await axios.get("https://osu.ppy.sh/api/v2/me", {
            headers: {
                "Authorization": "Bearer " + unhashedCookie.accessToken,
            },
        })
        const ogd_user_id = response.data.id
        const username = response.data.username

        response = await axios.get("https://osu.ppy.sh/api/v2/beatmapsets/" + beatmapsetId, {
            headers: {
                "Authorization": "Bearer " + unhashedCookie.accessToken,
            },
        })

        let consistent_status;
        if (response.data.status == "graveyard"){
            consistent_status = "graveyard"
        } else if (response.data.status == "wip" || response.data.status == "pending"){
            consistent_status = "pending"
        } else { //ranked, approved, qualified, loved
            consistent_status = "ranked"
        }

        // console.log(response.data)
        await Beatmapset.updateOne(
            { 
                beatmapset_id: response.data.id,
                ogd_user_id: ogd_user_id,
             },
            { 
                difficulty: difficulty,
                artist: response.data.artist,
                artist_unicode: response.data.artist_unicode,
                cover: response.data.covers['card@2x'],
                source: response.data.source,
                status: consistent_status,
                title: response.data.title,
                title_unicode: response.data.title_unicode,
                creator_id: response.data.user_id,
                creator_username: response.data.creator,
            },
            { 
                runValidators: true,
                upsert: true,
            }
        ).catch((err) => {
            console.log(err)
            return res.status(400).json({ hint: "error adding to database" });
        })

        console.log("POST /api/beatmapsets/: " + username)

        res.status(response_codes.OK).json()
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

export default router;