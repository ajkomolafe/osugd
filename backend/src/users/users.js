import axios from 'axios';
import express from 'express';
import Beatmapset from './beatmapset.js'
import Reminder from './reminder.js'
import jwt from 'jsonwebtoken';
import { getCookie } from '../cookie.js'
import { response_codes } from '../response_codes.js';

const router = express.Router();

/*Error numbers
200~ Good request
400~ User fault
500~ Server fault
*/

router.get("/me", async (req, res) => {
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
        console.log("GET /api/users/me\n\tErr: cookie isn't an actual cookie (jwt malformed)")
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
        console.log("GET /api/users/me\n\tuser: " + username)

        return res.status(response_codes.OK).json({
            username: username,
            avatar_url: avatar_url,
        });
    }
    catch (err) {
        console.log("Error: " + err.message)
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

//Create a user, json as param
router.post("/add_beatmapset", async (req, res) => {
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
        const user_id = response.data.ogd_user_id
        const username = response.data.username
        console.log("GET /api/users/add_beatmapset\n\tlink: " + link + "\n\tdifficulty: " + difficulty + "\n\tuser: " + username)

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
                ogd_user_id: user_id,
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
        console.log("\n\t" + response.data.title + " upserted to db")

        res.status(response_codes.OK).json()
    }
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
});

router.get("/get_beatmapsets", async (req, res) => {
    const type = req.query.type
    if (type != "graved" && type != "pending" && type != "ranked"){
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
        const user_id = response.data.id

        const beatmapsets = await Beatmapset.find({
            ogd_user_id: user_id,
            status: type,
        }).limit(3);

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

//all measurements are in seconds
router.post("/add_reminder", async (req, res) => {
    const frequency = req.body.frequency
    // console.log(typeof frequency)

    if (isNaN(Number(frequency))){
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "frequency is an invalid format"
        })
    }
    
    if (frequency < 6 * 60 * 60){ // 6 hours
        return res.status(response_codes.BAD_REQUEST).json({
            hint: "frequency is too short. minimum of 6 hours between reminders"
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

    let id;
    try {
        let response = await axios.get("https://osu.ppy.sh/api/v2/me", {
            headers: {
                "Authorization": "Bearer " + unhashedCookie.accessToken,
            },
        })
        id = response.data.id
        console.log("GET /api/users/set_reminder\n\tuser: " + response.data.username + "\n\tfrequency: " + req.body.frequency)
    }
    catch (err) {
        console.log("Error: " + err.message)
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

    await Reminder.updateOne(
            { 
                ogd_user_id: id,
             },
            { 
                last_reminder: (Date.now() / 1000),
                reminder_frequency: req.body.frequency,
            },
            { 
                runValidators: true,
                upsert: true,
            }
        ).catch((err) => {
            console.log(err)
            return res.status(400).json({ hint: "error adding to database" });
        })

    return res.status(response_codes.OK).json();
})

export default router;